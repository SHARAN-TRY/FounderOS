from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    picture: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SocialLogin(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    picture: Optional[str] = None


class DelegationBase(BaseModel):
    agent: str
    task_description: str
    status: str = "pending"

class DelegationCreate(DelegationBase):
    pass

class Delegation(DelegationBase):
    id: int
    task_id: int
    user_id: int

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    status: str = "pending"
    date: str
    goal_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    delegations: List[Delegation] = []

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    title: str
    risk: str = "Low"
    progress: int = 0
    completed_tasks: int = 0
    total_tasks: int = 0
    target_date: str

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    tasks: List[Task] = []

    class Config:
        from_attributes = True

class AgentActivityBase(BaseModel):
    agent_name: str
    action: str
    time: str
    icon_type: str
    bg_color: str

class AgentActivityCreate(AgentActivityBase):
    pass

class AgentActivity(AgentActivityBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AgentBase(BaseModel):
    name: str
    role: str

class AgentCreate(AgentBase):
    pass

class Agent(AgentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalBase(BaseModel):
    title: str
    status: str = "pending"

class ApprovalCreate(ApprovalBase):
    pass

class Approval(ApprovalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class WorkflowBase(BaseModel):
    name: str
    description: str

class WorkflowCreate(WorkflowBase):
    pass

class Workflow(WorkflowBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
