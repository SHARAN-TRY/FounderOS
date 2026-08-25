import json
import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import models
import auth
from database import get_db
from agent_system.gemini_client import GeminiClient
from agent_system.intent_router import IntentRouter
from agent_system.dag_engine import DAGEngine
from agent_system.queue_worker import QueueWorker
from agent_system.memory_manager import MemoryManager
from agent_system.metrics_service import MetricsService
from agent_system.agents import CEOAgent, HiringAgent, MarketingAgent, FinanceAgent, LegalAgent
from agent_system import schemas as agent_schemas

router = APIRouter(prefix="/api/agents", tags=["Autonomous 5-Agent Architecture"])

# Global Client and Router Instances
gemini_client = GeminiClient()
intent_router = IntentRouter(gemini_client)
dag_engine = DAGEngine(gemini_client)

agents_map = {
    "CEO": CEOAgent(gemini_client),
    "HIRING": HiringAgent(gemini_client),
    "MARKETING": MarketingAgent(gemini_client),
    "FINANCE": FinanceAgent(gemini_client),
    "LEGAL": LegalAgent(gemini_client)
}

# -----------------------------------------------------------------
# 1. Dynamic Routing Endpoint
# -----------------------------------------------------------------
@router.post("/route", response_model=agent_schemas.IntentClassification)
def route_task_intent(req: agent_schemas.AgentTaskCreate):
    """
    Ingests any user task input, analyzes its intent, and classifies the domain
    (CEO, HIRING, MARKETING, FINANCE, LEGAL) with recommended execution mode.
    """
    if not req.input_prompt or not req.input_prompt.strip():
        raise HTTPException(status_code=400, detail="input_prompt cannot be empty")
    
    classification = intent_router.classify(req.input_prompt)
    return classification

# -----------------------------------------------------------------
# 2. Autonomous Task Execution Endpoint
# -----------------------------------------------------------------
@router.post("/execute")
def execute_autonomous_task(
    req: agent_schemas.AgentTaskCreate,
    db: Session = Depends(get_db),
    current_user: Optional[Any] = Depends(auth.get_current_user_optional if hasattr(auth, "get_current_user_optional") else lambda: None)
):
    """
    Autonomous Execution Pipeline:
    1. Analyzes intent & classifies domain (or uses provided target_agent).
    2. Routes directly to the designated agent or triggers CEO DAG.
    3. Produces complete domain artifacts and saves to agent_tasks, executions, & dashboard_metrics.
    """
    if not req.input_prompt or not req.input_prompt.strip():
        raise HTTPException(status_code=400, detail="input_prompt cannot be empty")
    
    user_id = current_user.id if current_user else None

    # Step 1: Routing
    if req.target_agent and req.target_agent.upper() in agents_map:
        target_domain = req.target_agent.upper()
        routing_info = {
            "domain": target_domain,
            "confidence": 1.0,
            "reasoning": "Explicit target_agent designated by caller",
            "recommended_mode": "DIRECT_AGENT"
        }
    else:
        classification = intent_router.classify(req.input_prompt)
        target_domain = classification.domain
        routing_info = classification.model_dump()

    # Step 2: Execution
    agent_instance = agents_map.get(target_domain, agents_map["CEO"])
    start_time = time.time()
    
    exec_result = agent_instance.execute(req.input_prompt, context=req.context_data or {})
    duration_ms = exec_result.get("execution_time_ms", int((time.time() - start_time) * 1000))

    # Step 3: Record to agent_tasks Table
    agent_task_rec = models.AgentTask(
        task_id=req.task_id,
        user_id=user_id,
        agent_name=target_domain,
        intent=exec_result.get("intent", f"{target_domain}_TASK"),
        input_prompt=req.input_prompt,
        status="COMPLETED",
        result_summary=exec_result.get("result_summary", ""),
        artifact_payload=json.dumps(exec_result.get("artifact_payload", {})),
        tokens_used=exec_result.get("tokens_used", 0),
        execution_time_ms=duration_ms
    )
    db.add(agent_task_rec)
    db.commit()
    db.refresh(agent_task_rec)

    # Step 4: Record to Executions Table
    exec_log = models.ExecutionLog(
        task_id=req.task_id,
        user_id=user_id,
        agent_name=target_domain,
        step_name=f"Autonomous Execution: {target_domain}",
        status="SUCCESS",
        duration_ms=duration_ms,
        tokens_consumed=exec_result.get("tokens_used", 0),
        log_details=json.dumps({"summary": exec_result.get("result_summary", "")})
    )
    db.add(exec_log)
    db.commit()

    # Step 5: Update Metrics
    MetricsService.calculate_and_save_metrics(db)

    return {
        "task_id": agent_task_rec.id,
        "agent_name": target_domain,
        "routing": routing_info,
        "status": "COMPLETED",
        "result_summary": exec_result.get("result_summary", ""),
        "artifact_payload": exec_result.get("artifact_payload", {}),
        "tokens_used": exec_result.get("tokens_used", 0),
        "execution_time_ms": duration_ms,
        "created_at": agent_task_rec.created_at.isoformat() if agent_task_rec.created_at else None
    }

# -----------------------------------------------------------------
# 3. CEO Multi-Agent DAG Workflow Execution
# -----------------------------------------------------------------
@router.post("/dag/execute")
def execute_dag_workflow(
    req: agent_schemas.AgentTaskCreate,
    db: Session = Depends(get_db),
    current_user: Optional[Any] = Depends(auth.get_current_user_optional if hasattr(auth, "get_current_user_optional") else lambda: None)
):
    """
    Executes a multi-agent workflow DAG across CEO, Finance, Marketing, Hiring, and Legal agents.
    """
    user_id = current_user.id if current_user else None
    result = dag_engine.execute_workflow(
        db=db,
        prompt=req.input_prompt,
        user_id=user_id,
        parent_task_id=req.task_id
    )
    MetricsService.calculate_and_save_metrics(db)
    return result

# -----------------------------------------------------------------
# 4. Domain Agent Direct Endpoints
# -----------------------------------------------------------------
@router.post("/{agent_name}/run")
def run_specific_agent(
    agent_name: str,
    req: agent_schemas.AgentTaskCreate,
    db: Session = Depends(get_db),
    current_user: Optional[Any] = Depends(auth.get_current_user_optional if hasattr(auth, "get_current_user_optional") else lambda: None)
):
    agent_key = agent_name.upper()
    if agent_key not in agents_map:
        raise HTTPException(status_code=400, detail=f"Unknown agent: {agent_name}. Valid agents: CEO, HIRING, MARKETING, FINANCE, LEGAL")
    
    req.target_agent = agent_key
    return execute_autonomous_task(req, db, current_user)

# -----------------------------------------------------------------
# 5. Agent Tasks Query Endpoint
# -----------------------------------------------------------------
@router.get("/tasks")
def list_agent_tasks(
    agent_name: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(models.AgentTask)
    if agent_name:
        query = query.filter(models.AgentTask.agent_name == agent_name.upper())
    if status:
        query = query.filter(models.AgentTask.status == status.upper())
    
    tasks = query.order_by(models.AgentTask.created_at.desc()).limit(limit).all()
    results = []
    for t in tasks:
        payload = {}
        try:
            payload = json.loads(t.artifact_payload)
        except Exception:
            pass
        results.append({
            "id": t.id,
            "task_id": t.task_id,
            "agent_name": t.agent_name,
            "intent": t.intent,
            "input_prompt": t.input_prompt,
            "status": t.status,
            "result_summary": t.result_summary,
            "artifact_payload": payload,
            "tokens_used": t.tokens_used,
            "execution_time_ms": t.execution_time_ms,
            "created_at": t.created_at.isoformat() if t.created_at else None
        })
    return results

@router.get("/tasks/{agent_task_id}")
def get_agent_task_detail(agent_task_id: int, db: Session = Depends(get_db)):
    t = db.query(models.AgentTask).filter(models.AgentTask.id == agent_task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Agent task not found")
    
    payload = {}
    try:
        payload = json.loads(t.artifact_payload)
    except Exception:
        pass

    return {
        "id": t.id,
        "task_id": t.task_id,
        "agent_name": t.agent_name,
        "intent": t.intent,
        "input_prompt": t.input_prompt,
        "status": t.status,
        "result_summary": t.result_summary,
        "artifact_payload": payload,
        "tokens_used": t.tokens_used,
        "execution_time_ms": t.execution_time_ms,
        "created_at": t.created_at.isoformat() if t.created_at else None
    }

# -----------------------------------------------------------------
# 6. Workflow DAG Query Endpoint
# -----------------------------------------------------------------
@router.get("/dag/{workflow_id}")
def get_workflow_dag_status(workflow_id: str, db: Session = Depends(get_db)):
    steps = db.query(models.WorkflowDAG).filter(
        models.WorkflowDAG.workflow_id == workflow_id
    ).order_by(models.WorkflowDAG.step_order.asc()).all()

    if not steps:
        raise HTTPException(status_code=404, detail="Workflow DAG not found")

    step_data = []
    for s in steps:
        res = {}
        try:
            res = json.loads(s.output_result)
        except Exception:
            pass
        deps = []
        try:
            deps = json.loads(s.dependencies)
        except Exception:
            pass

        step_data.append({
            "step_order": s.step_order,
            "agent_name": s.agent_name,
            "dependencies": deps,
            "status": s.status,
            "output_result": res,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None
        })

    return {
        "workflow_id": workflow_id,
        "steps_count": len(step_data),
        "steps": step_data
    }

# -----------------------------------------------------------------
# 7. Pending Queue Endpoints
# -----------------------------------------------------------------
@router.get("/queue")
def get_pending_queue(limit: int = 50, db: Session = Depends(get_db)):
    return QueueWorker.list_queue(db, limit=limit)

@router.post("/queue/enqueue")
def enqueue_pending_task(
    req: agent_schemas.QueueTaskRequest,
    db: Session = Depends(get_db),
    current_user: Optional[Any] = Depends(auth.get_current_user_optional if hasattr(auth, "get_current_user_optional") else lambda: None)
):
    target = req.target_agent or intent_router.classify(req.input_prompt).domain
    user_id = current_user.id if current_user else None
    
    item = QueueWorker.enqueue(
        db=db,
        payload={"input_prompt": req.input_prompt, "context": req.context_data or {}},
        target_agent=target,
        priority=req.priority,
        user_id=user_id
    )
    return {"message": "Task queued successfully", "queue_id": item.id, "target_agent": target, "status": item.status}

@router.post("/queue/process-next")
def process_next_queue_item(db: Session = Depends(get_db)):
    item = QueueWorker.acquire_next_task(db)
    if not item:
        return {"status": "NO_TASKS", "message": "Queue is currently empty"}

    try:
        payload = json.loads(item.task_payload)
        prompt = payload.get("input_prompt", "")
        agent_key = item.target_agent.upper()
        agent_instance = agents_map.get(agent_key, agents_map["CEO"])

        res = agent_instance.execute(prompt, context=payload.get("context", {}))
        
        # Save to agent_tasks
        task_rec = models.AgentTask(
            agent_name=agent_key,
            intent=res.get("intent", f"{agent_key}_TASK"),
            input_prompt=prompt,
            status="COMPLETED",
            result_summary=res.get("result_summary", ""),
            artifact_payload=json.dumps(res.get("artifact_payload", {})),
            tokens_used=res.get("tokens_used", 0),
            execution_time_ms=res.get("execution_time_ms", 0)
        )
        db.add(task_rec)
        db.commit()

        QueueWorker.mark_completed(db, item.id)
        MetricsService.calculate_and_save_metrics(db)

        return {"status": "SUCCESS", "queue_id": item.id, "agent_name": agent_key, "result": res.get("result_summary")}
    except Exception as e:
        QueueWorker.mark_failed(db, item.id, str(e))
        return {"status": "ERROR", "queue_id": item.id, "error": str(e)}

# -----------------------------------------------------------------
# 8. Dashboard Metrics Endpoint
# -----------------------------------------------------------------
@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    return MetricsService.get_cached_or_fresh_metrics(db)

# -----------------------------------------------------------------
# 9. Memory Store Endpoints
# -----------------------------------------------------------------
@router.get("/memory")
def get_agent_memory(
    agent_name: Optional[str] = None,
    session_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return MemoryManager.get_memories(db, agent_name=agent_name, session_id=session_id, limit=limit)

@router.post("/memory")
def save_agent_memory(
    agent_name: str,
    session_id: str,
    context_key: str,
    context_value: Dict[str, Any],
    memory_type: str = "SHORT_TERM",
    db: Session = Depends(get_db)
):
    mem = MemoryManager.save_memory(
        db=db,
        agent_name=agent_name,
        session_id=session_id,
        context_key=context_key,
        context_value=context_value,
        memory_type=memory_type
    )
    return {"message": "Memory persisted", "id": mem.id}

# -----------------------------------------------------------------
# 10. Executions Audit Log Endpoint
# -----------------------------------------------------------------
@router.get("/executions")
def list_execution_logs(
    agent_name: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(models.ExecutionLog)
    if agent_name:
        query = query.filter(models.ExecutionLog.agent_name == agent_name.upper())
    
    logs = query.order_by(models.ExecutionLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        details = {}
        try:
            details = json.loads(l.log_details)
        except Exception:
            pass
        results.append({
            "id": l.id,
            "task_id": l.task_id,
            "agent_name": l.agent_name,
            "step_name": l.step_name,
            "status": l.status,
            "duration_ms": l.duration_ms,
            "tokens_consumed": l.tokens_consumed,
            "deliverable_path": l.deliverable_path,
            "log_details": details,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return results
