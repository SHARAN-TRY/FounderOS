import json
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

import models

logger = logging.getLogger(__name__)

class QueueWorker:
    """
    Manages persistent pending task queue with automatic retry,
    locking mechanism, and background task resumption to prevent lost tasks.
    """
    def __init__(self):
        pass

    @staticmethod
    def enqueue(
        db: Session,
        payload: Dict[str, Any],
        target_agent: str,
        priority: int = 1,
        user_id: Optional[int] = None
    ) -> models.PendingQueueItem:
        item = models.PendingQueueItem(
            user_id=user_id,
            task_payload=json.dumps(payload),
            target_agent=target_agent.upper(),
            priority=priority,
            status="QUEUED",
            retry_count=0,
            max_retries=3
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def acquire_next_task(db: Session) -> Optional[models.PendingQueueItem]:
        """
        Locks the highest priority QUEUED or RETRYING task for processing.
        """
        item = db.query(models.PendingQueueItem).filter(
            models.PendingQueueItem.status.in_(["QUEUED", "RETRYING"])
        ).order_by(
            models.PendingQueueItem.priority.desc(),
            models.PendingQueueItem.created_at.asc()
        ).first()

        if item:
            lock_token = uuid.uuid4().hex
            item.status = "PROCESSING"
            item.lock_token = lock_token
            item.locked_at = datetime.utcnow()
            db.commit()
            db.refresh(item)
            return item
        return None

    @staticmethod
    def mark_completed(db: Session, item_id: int):
        item = db.query(models.PendingQueueItem).filter(models.PendingQueueItem.id == item_id).first()
        if item:
            item.status = "COMPLETED"
            item.lock_token = None
            db.commit()

    @staticmethod
    def mark_failed(db: Session, item_id: int, error_msg: str):
        item = db.query(models.PendingQueueItem).filter(models.PendingQueueItem.id == item_id).first()
        if item:
            item.retry_count += 1
            item.error_log = error_msg
            if item.retry_count < item.max_retries:
                item.status = "RETRYING"
            else:
                item.status = "FAILED"
            item.lock_token = None
            db.commit()

    @staticmethod
    def list_queue(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        items = db.query(models.PendingQueueItem).order_by(
            models.PendingQueueItem.created_at.desc()
        ).limit(limit).all()

        results = []
        for i in items:
            payload_obj = {}
            try:
                payload_obj = json.loads(i.task_payload)
            except Exception:
                pass
            results.append({
                "id": i.id,
                "target_agent": i.target_agent,
                "priority": i.priority,
                "status": i.status,
                "retry_count": i.retry_count,
                "max_retries": i.max_retries,
                "error_log": i.error_log,
                "payload": payload_obj,
                "created_at": i.created_at.isoformat() if i.created_at else None
            })
        return results
