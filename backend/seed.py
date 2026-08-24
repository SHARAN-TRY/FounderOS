from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
from datetime import datetime

# Initialize the database tables
models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(models.Goal).first():
        print("Database already seeded.")
        return

    # Create Goals
    goal1 = models.Goal(
        title="Launch my startup in 30 days",
        risk="High",
        progress=65,
        completed_tasks=4,
        total_tasks=12,
        target_date="Aug 30, 2026"
    )
    
    goal2 = models.Goal(
        title="Secure pre-seed funding",
        risk="Medium",
        progress=20,
        completed_tasks=2,
        total_tasks=10,
        target_date="Sept 15, 2026"
    )

    db.add_all([goal1, goal2])
    db.commit()
    db.refresh(goal1)
    db.refresh(goal2)

    # Create Tasks
    task1 = models.Task(
        title="Hire a frontend engineer and map SaaS legal docs",
        status="running",
        date="Aug 24, 2026",
        goal_id=goal1.id
    )
    db.add(task1)
    db.commit()
    db.refresh(task1)

    # Create Delegations
    del1 = models.Delegation(
        agent="Hiring",
        task_description="Define frontend engineer compensation and post job",
        status="completed",
        task_id=task1.id
    )
    del2 = models.Delegation(
        agent="Legal",
        task_description="Review standard SaaS contract template",
        status="pending",
        task_id=task1.id
    )
    db.add_all([del1, del2])
    db.commit()

    print("Database successfully seeded!")
    db.close()

if __name__ == "__main__":
    seed_db()
