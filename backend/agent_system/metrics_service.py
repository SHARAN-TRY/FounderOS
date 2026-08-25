import json
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

import models

class MetricsService:
    """
    Computes system KPIs, agent workloads, aggregated completion metrics,
    and caches/retrieves real-time execution statistics from dashboard_metrics.
    """
    @staticmethod
    def calculate_and_save_metrics(db: Session) -> Dict[str, Any]:
        total_tasks = db.query(models.AgentTask).count()
        completed_tasks = db.query(models.AgentTask).filter(models.AgentTask.status == "COMPLETED").count()
        failed_tasks = db.query(models.AgentTask).filter(models.AgentTask.status == "FAILED").count()
        pending_queue_count = db.query(models.PendingQueueItem).filter(
            models.PendingQueueItem.status.in_(["QUEUED", "PROCESSING", "RETRYING"])
        ).count()

        # Workload per agent
        workload_query = db.query(
            models.AgentTask.agent_name,
            func.count(models.AgentTask.id)
        ).group_by(models.AgentTask.agent_name).all()
        agent_workloads = {agent.upper(): count for agent, count in workload_query}
        for default_agent in ["CEO", "HIRING", "MARKETING", "FINANCE", "LEGAL"]:
            if default_agent not in agent_workloads:
                agent_workloads[default_agent] = 0

        # Average duration
        avg_duration = db.query(func.avg(models.AgentTask.execution_time_ms)).scalar() or 0.0

        # Total tokens consumed
        total_tokens = db.query(func.sum(models.AgentTask.tokens_used)).scalar() or 0

        metrics_summary = {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_queue_count,
            "failed_tasks": failed_tasks,
            "agent_workloads": agent_workloads,
            "avg_execution_ms": round(float(avg_duration), 2),
            "tokens_consumed_total": int(total_tokens),
            "system_health": "OPTIMAL",
            "last_updated": datetime.utcnow().isoformat()
        }

        # Cache in dashboard_metrics table
        metric_rec = db.query(models.DashboardMetric).filter(
            models.DashboardMetric.metric_key == "SYSTEM_SUMMARY_KPI"
        ).first()

        if not metric_rec:
            metric_rec = models.DashboardMetric(
                metric_key="SYSTEM_SUMMARY_KPI",
                metric_value=json.dumps(metrics_summary),
                category="SYSTEM_KPI"
            )
            db.add(metric_rec)
        else:
            metric_rec.metric_value = json.dumps(metrics_summary)
            metric_rec.last_updated = datetime.utcnow()
        
        db.commit()
        return metrics_summary

    @staticmethod
    def get_cached_or_fresh_metrics(db: Session) -> Dict[str, Any]:
        metric_rec = db.query(models.DashboardMetric).filter(
            models.DashboardMetric.metric_key == "SYSTEM_SUMMARY_KPI"
        ).first()

        if metric_rec:
            try:
                return json.loads(metric_rec.metric_value)
            except Exception:
                pass
        return MetricsService.calculate_and_save_metrics(db)
