from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import os

import models
import schemas
from database import engine, get_db
import auth

# Create all tables (in a real app you'd use Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FounderOS API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        picture=user.picture
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/social", response_model=schemas.Token)
def social_login(social_user: schemas.SocialLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == social_user.email).first()
    if not user:
        import secrets
        random_password = auth.get_password_hash(secrets.token_urlsafe(32))
        new_user = models.User(
            email=social_user.email,
            hashed_password=random_password,
            full_name=social_user.full_name,
            picture=social_user.picture
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).all()
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    activities = db.query(models.AgentActivity).filter(models.AgentActivity.user_id == current_user.id).order_by(models.AgentActivity.created_at.desc()).limit(10).all()
    
    return {
        "goals": [schemas.Goal.model_validate(g) for g in goals],
        "tasks": [schemas.Task.model_validate(t) for t in tasks],
        "activities": [schemas.AgentActivity.model_validate(a) for a in activities]
    }

@app.get("/api/goals", response_model=List[schemas.Goal])
def read_goals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).offset(skip).limit(limit).all()
    return goals

@app.post("/api/goals", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_goal = models.Goal(**goal.model_dump(), user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/api/tasks", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).offset(skip).limit(limit).all()
    return tasks

@app.post("/api/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_task = models.Task(**task.model_dump(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.post("/api/tasks/{task_id}/analyze")
def analyze_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """
    Mock CEO Agent Endpoint.
    This simulates the CEO Agent breaking down a task and delegating it to other agents.
    """
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Mocking real CEO agent output for now
    # We will simulate delegating to Hiring, Marketing, Finance, Legal based on task content later if needed,
    # but for now we'll just mock static ones.
    delegations = [
        {"agent": "Hiring", "task_description": "Define JD based on task context", "status": "pending"},
        {"agent": "Marketing", "task_description": "Draft social media post for announcement", "status": "pending"},
        {"agent": "Finance", "task_description": "Allocate budget for execution", "status": "pending"},
        {"agent": "Legal", "task_description": "Verify compliance and draft agreements", "status": "pending"}
    ]
    
    for d in delegations:
        db_delegation = models.Delegation(
            agent=d["agent"],
            task_description=d["task_description"],
            status=d["status"],
            task_id=task.id,
            user_id=current_user.id
        )
        db.add(db_delegation)
        
    db.commit()
    db.refresh(task)
    return task
