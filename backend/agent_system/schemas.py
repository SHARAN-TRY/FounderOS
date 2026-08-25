from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class IntentClassification(BaseModel):
    domain: str = Field(..., description="Target domain: CEO, HIRING, MARKETING, FINANCE, LEGAL, or COMPOSITE_DAG")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    reasoning: str = Field(..., description="Brief rationale for the routing decision")
    recommended_mode: str = Field(..., description="DIRECT_AGENT or DAG_WORKFLOW")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted domain entities")

class AgentTaskCreate(BaseModel):
    input_prompt: str
    target_agent: Optional[str] = None  # CEO, HIRING, MARKETING, FINANCE, LEGAL (auto-classified if empty)
    task_id: Optional[int] = None
    context_data: Optional[Dict[str, Any]] = None

class AgentTaskResult(BaseModel):
    id: Optional[int] = None
    agent_name: str
    intent: str
    input_prompt: str
    status: str
    result_summary: str
    artifact_payload: Dict[str, Any]
    tokens_used: int = 0
    execution_time_ms: int = 0
    created_at: Optional[datetime] = None

class DAGStep(BaseModel):
    step_order: int
    agent_name: str
    responsibility: str
    dependencies: List[str] = Field(default_factory=list)
    status: str = "WAITING"
    input_context: Dict[str, Any] = Field(default_factory=dict)
    output_result: Dict[str, Any] = Field(default_factory=dict)

class DAGWorkflow(BaseModel):
    workflow_id: str
    goal: str
    parent_task_id: Optional[int] = None
    status: str = "PENDING"
    steps: List[DAGStep] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class ApprovalDecision(BaseModel):
    decision: str = "APPROVED"  # APPROVED, REJECTED, MODIFIED
    feedback: Optional[str] = None
    action_payload: Optional[Dict[str, Any]] = None

class QueueTaskRequest(BaseModel):
    input_prompt: str
    target_agent: Optional[str] = None
    priority: int = 1
    context_data: Optional[Dict[str, Any]] = None

class MetricsSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    failed_tasks: int
    agent_workloads: Dict[str, int]
    avg_execution_ms: float
    system_health: str = "HEALTHY"
    last_updated: datetime
