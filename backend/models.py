from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
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
    status = Column(String, default="pending")
    date = Column(String)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")
    delegations = relationship("Delegation", back_populates="task")

class Delegation(Base):
    __tablename__ = "delegations"

    id = Column(Integer, primary_key=True, index=True)
    agent = Column(String)
    task_description = Column(String)
    status = Column(String, default="pending")
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
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
    status = Column(String, default="pending")
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="approvals")

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workflows")
