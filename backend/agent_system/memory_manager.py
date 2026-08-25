import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

import models

class MemoryManager:
    """
    Manages multi-turn conversational context, cross-session agent memory,
    and historical reference data in the SQLite memory_store table.
    """
    @staticmethod
    def save_memory(
        db: Session,
        agent_name: str,
        session_id: str,
        context_key: str,
        context_value: Any,
        memory_type: str = "SHORT_TERM",
        user_id: Optional[int] = None
    ) -> models.MemoryStore:
        val_str = json.dumps(context_value) if isinstance(context_value, (dict, list)) else str(context_value)
        mem = models.MemoryStore(
            user_id=user_id,
            agent_name=agent_name.upper(),
            session_id=session_id,
            memory_type=memory_type,
            context_key=context_key,
            context_value=val_str
        )
        db.add(mem)
        db.commit()
        db.refresh(mem)
        return mem

    @staticmethod
    def get_memories(
        db: Session,
        agent_name: Optional[str] = None,
        session_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        query = db.query(models.MemoryStore)
        if agent_name:
            query = query.filter(models.MemoryStore.agent_name == agent_name.upper())
        if session_id:
            query = query.filter(models.MemoryStore.session_id == session_id)
        
        records = query.order_by(models.MemoryStore.created_at.desc()).limit(limit).all()
        results = []
        for r in records:
            val = r.context_value
            try:
                val = json.loads(r.context_value)
            except Exception:
                pass
            results.append({
                "id": r.id,
                "agent_name": r.agent_name,
                "session_id": r.session_id,
                "memory_type": r.memory_type,
                "key": r.context_key,
                "value": val,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })
        return results
