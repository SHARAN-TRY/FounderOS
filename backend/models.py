from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    goals = relationship("Goal", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    delegations = relationship("Delegation", back_populates="user")
    agent_activities = relationship("AgentActivity", back_populates="user")
    agents = relationship("Agent", back_populates="user")
    approvals = relationship("Approval", back_populates="user")
    workflows = relationship("Workflow", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    agent_messages = relationship("AgentMessage", back_populates="user")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    risk = Column(String, default="Low")
    progress = Column(Integer, default=0)
    completed_tasks = Column(Integer, default=0)
    total_tasks = Column(Integer, default=0)
    target_date = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    # State lifecycle: DRAFT, CEO_ANALYZING, PLAN_READY, AWAITING_PLAN_APPROVAL, APPROVED, READY, RUNNING, AWAITING_RESULT_APPROVAL, COMPLETED, REJECTED, PAUSED, BLOCKED, NEEDS_REVISION
    status = Column(String, default="DRAFT")
    date = Column(String)
    progress = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    plan_data = Column(Text, nullable=True)  # JSON text with CEO plan, analysis, steps, risks
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")
    delegations = relationship("Delegation", back_populates="task", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="task", cascade="all, delete-orphan")
    agent_messages = relationship("AgentMessage", back_populates="task", cascade="all, delete-orphan")


class Delegation(Base):
    __tablename__ = "delegations"

    id = Column(Integer, primary_key=True, index=True)
    agent = Column(String)  # Agent name: Finance, Marketing, Hiring, Legal, Operations, Sales, Research
    task_description = Column(Text)
    # State lifecycle: BLOCKED, READY, RUNNING, AWAITING_APPROVAL, COMPLETED, REVISED, FAILED, RETRYING, WAITING_FOR_INPUT, CANCELLED, PAUSED
    status = Column(String, default="BLOCKED")
    order_index = Column(Integer, default=1)
    dependencies = Column(Text, default="[]")  # JSON list of prerequisite agent names
    context_input = Column(Text, default="{}")  # JSON data passed from CEO or upstream agents
    decision_summary = Column(Text, nullable=True)  # Concise decision summary for founder
    result_output = Column(Text, default="{}")  # JSON structured result
    actions_available = Column(Text, default="[]")  # JSON list of consequential action objects
    actions_taken = Column(Text, default="[]")  # JSON list of completed actions
    error_message = Column(Text, nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="delegations")
    task = relationship("Task", back_populates="delegations")


class AgentActivity(Base):
    __tablename__ = "agent_activity"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String)
    action = Column(String)
    time = Column(String)
    icon_type = Column(String)
    bg_color = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="agent_activities")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="agents")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    approval_level = Column(String, default="PLAN_APPROVAL")  # PLAN_APPROVAL, RESULT_APPROVAL, CONSEQUENTIAL_ACTION_APPROVAL
    action_name = Column(String, nullable=True)
    decision = Column(String, default="APPROVED")  # APPROVED, REJECTED, MODIFIED
    feedback = Column(Text, nullable=True)
    action_payload = Column(Text, nullable=True)  # JSON payload of the action taken
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    delegation_id = Column(Integer, ForeignKey("delegations.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="approvals")
    task = relationship("Task", back_populates="approvals")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    agent_name = Column(String)
    action_type = Column(String)  # ORCHESTRATION, EXECUTION, APPROVAL, CONSEQUENTIAL_ACTION, REVISION, ERROR
    summary = Column(String)
    details = Column(Text, default="{}")  # JSON structured details
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    sender = Column(String)  # CEO, Finance, Marketing, Hiring, Legal, Founder
    recipient = Column(String)  # CEO, Finance, Marketing, Hiring, Legal, Founder
    message_type = Column(String)  # DIRECTIVE, QUERY, RESULT, FEEDBACK, STATUS_UPDATE
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="agent_messages")
    task = relationship("Task", back_populates="agent_messages")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workflows")


class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent_name = Column(String(50), nullable=False)  # CEO, HIRING, MARKETING, FINANCE, LEGAL
    intent = Column(String(100), nullable=False)
    input_prompt = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED
    result_summary = Column(Text, nullable=True)
    artifact_payload = Column(Text, default="{}")  # JSON containing domain documents, tables, copy, models
    tokens_used = Column(Integer, default=0)
    execution_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DashboardMetric(Base):
    __tablename__ = "dashboard_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_key = Column(String(100), unique=True, nullable=False, index=True)
    metric_value = Column(Text, nullable=False)  # JSON or numeric string
    category = Column(String(50), nullable=False)  # AGENT_WORKLOAD, PERFORMANCE, SYSTEM_KPI
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PendingQueueItem(Base):
    __tablename__ = "pending_queue"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    task_payload = Column(Text, nullable=False)  # Serialized JSON task specification
    target_agent = Column(String(50), nullable=False)
    priority = Column(Integer, default=1)
    status = Column(String(50), default="QUEUED")  # QUEUED, PROCESSING, RETRYING, COMPLETED, FAILED
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    lock_token = Column(String(100), nullable=True)
    locked_at = Column(DateTime, nullable=True)
    error_log = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WorkflowDAG(Base):
    __tablename__ = "workflow_dag"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(100), nullable=False, index=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    step_order = Column(Integer, nullable=False)
    agent_name = Column(String(50), nullable=False)
    dependencies = Column(Text, default="[]")  # JSON array of required upstream agent names/step IDs
    status = Column(String(50), default="WAITING")  # WAITING, READY, IN_PROGRESS, COMPLETED, BLOCKED, FAILED
    input_context = Column(Text, default="{}")  # JSON context passed from upstream agents
    output_result = Column(Text, default="{}")  # JSON output generated by this step
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class MemoryStore(Base):
    __tablename__ = "memory_store"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent_name = Column(String(50), nullable=False)
    session_id = Column(String(100), nullable=False, index=True)
    memory_type = Column(String(50), default="SHORT_TERM")  # SHORT_TERM, LONG_TERM, ENTITY_FACT
    context_key = Column(String(100), nullable=False)
    context_value = Column(Text, nullable=False)  # Serialized context / memory representation
    created_at = Column(DateTime, default=datetime.utcnow)


class ExecutionLog(Base):
    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent_name = Column(String(50), nullable=False)
    step_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)  # SUCCESS, ERROR, RETRY
    duration_ms = Column(Integer, default=0)
    tokens_consumed = Column(Integer, default=0)
    deliverable_path = Column(String(500), nullable=True)
    log_details = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
