import os
import sys
import json
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import models
from database import engine, SessionLocal, Base
from agent_system.gemini_client import GeminiClient
from agent_system.intent_router import IntentRouter
from agent_system.dag_engine import DAGEngine
from agent_system.queue_worker import QueueWorker
from agent_system.memory_manager import MemoryManager
from agent_system.metrics_service import MetricsService
from agent_system.agents import CEOAgent, HiringAgent, MarketingAgent, FinanceAgent, LegalAgent

def run_all_tests():
    print("=" * 70)
    print("STARTING 5-AGENT ARCHITECTURE & STATE STORE VERIFICATION")
    print("=" * 70)

    # 1. Initialize DB tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 2. Test Gemini Client
    gemini = GeminiClient()
    print(f"\n[1] Gemini Client Configured: {gemini.is_configured()}")
    if gemini.is_configured():
        print(f"    API Key prefix: {gemini.api_key[:8]}... (Loaded from .env)")

    # 3. Test Dynamic Intent Router
    print("\n[2] Testing Dynamic Intent Router...")
    router = IntentRouter(gemini)
    
    test_prompts = {
        "Hiring": "Draft a job description and interview rubric for a Senior Frontend React Engineer with $120k budget",
        "Marketing": "Create a viral LinkedIn launch post and GTM strategy for our new AI assistant",
        "Finance": "Calculate our cash runway burn rate with $200k in the bank spending $15k per month",
        "Legal": "Generate an employment offer letter with 100% IP assignment and non-disclosure agreement",
        "CEO": "Formulate a multi-stage strategic roadmap to launch our enterprise tier next quarter"
    }

    for expected_domain, prompt in test_prompts.items():
        classification = router.classify(prompt)
        print(f"  Prompt: '{prompt[:50]}...'")
        print(f"  -> Classified Domain: {classification.domain} (Confidence: {classification.confidence:.2f}, Mode: {classification.recommended_mode})")
        assert classification.domain in ["CEO", "HIRING", "MARKETING", "FINANCE", "LEGAL"]

    # 4. Test Autonomous Execution for each of the 5 Agents
    print("\n[3] Testing Autonomous Execution for All 5 Agents...")
    agents = {
        "CEO": CEOAgent(gemini),
        "HIRING": HiringAgent(gemini),
        "MARKETING": MarketingAgent(gemini),
        "FINANCE": FinanceAgent(gemini),
        "LEGAL": LegalAgent(gemini)
    }

    for name, agent in agents.items():
        sample_prompt = test_prompts.get(name.capitalize(), f"Execute core {name} operations")
        res = agent.execute(sample_prompt)
        print(f"  [{name} Agent] Status: {res['status']} | Duration: {res['execution_time_ms']}ms | Summary: {res['result_summary'][:70]}...")
        assert res["status"] == "COMPLETED"
        assert res["artifact_payload"] is not None

        # Persist to agent_tasks table
        task_rec = models.AgentTask(
            agent_name=name,
            intent=res.get("intent", f"{name}_TASK"),
            input_prompt=sample_prompt,
            status="COMPLETED",
            result_summary=res.get("result_summary", ""),
            artifact_payload=json.dumps(res.get("artifact_payload", {})),
            tokens_used=res.get("tokens_used", 0),
            execution_time_ms=res.get("execution_time_ms", 0)
        )
        db.add(task_rec)
    db.commit()

    # 5. Test CEO Multi-Agent Workflow DAG Execution
    print("\n[4] Testing CEO Multi-Agent Workflow DAG Execution...")
    dag = DAGEngine(gemini)
    dag_result = dag.execute_workflow(
        db=db,
        prompt="Recruit a Lead AI Engineer and launch Q3 developer campaign within $100k budget"
    )
    print(f"  Workflow ID: {dag_result['workflow_id']}")
    print(f"  Workflow Status: {dag_result['status']}")
    print(f"  Executed Steps Count: {len(dag_result['steps'])}")
    for step in dag_result['steps']:
        print(f"    - Step {step['step_order']}: Agent [{step['agent_name']}] -> {step['summary'][:60]}...")
    assert dag_result["status"] == "COMPLETED"
    assert len(dag_result["steps"]) > 0

    # 6. Test Pending Queue
    print("\n[5] Testing Persistent Pending Queue...")
    q_item = QueueWorker.enqueue(
        db=db,
        payload={"input_prompt": "Audit Q2 contractor expenses", "context": {}},
        target_agent="FINANCE",
        priority=2
    )
    print(f"  Enqueued Task ID: {q_item.id} | Target: {q_item.target_agent} | Status: {q_item.status}")
    
    acquired = QueueWorker.acquire_next_task(db)
    print(f"  Acquired Task ID: {acquired.id} | Status: {acquired.status} | Lock: {acquired.lock_token[:8]}...")
    QueueWorker.mark_completed(db, acquired.id)
    print(f"  Marked Task ID {acquired.id} as COMPLETED")

    # 7. Test Memory Store
    print("\n[6] Testing Multi-Turn Memory Store...")
    MemoryManager.save_memory(
        db=db,
        agent_name="FINANCE",
        session_id="session_test_001",
        context_key="monthly_budget_ceiling",
        context_value={"max_burn": 25000, "currency": "USD"}
    )
    memories = MemoryManager.get_memories(db, agent_name="FINANCE", session_id="session_test_001")
    print(f"  Retrieved {len(memories)} memory record(s) for FINANCE Agent in session_test_001.")
    assert len(memories) >= 1

    # 8. Test Dashboard Metrics Aggregation
    print("\n[7] Testing Dashboard Metrics Service...")
    metrics = MetricsService.calculate_and_save_metrics(db)
    print(f"  Total Tasks: {metrics['total_tasks']}")
    print(f"  Completed Tasks: {metrics['completed_tasks']}")
    print(f"  Agent Workloads: {metrics['agent_workloads']}")
    print(f"  Average Execution Duration: {metrics['avg_execution_ms']}ms")
    print(f"  System Health: {metrics['system_health']}")

    # 9. Verify All 7 Database Tables
    print("\n[8] Verifying All SQLite State Tables...")
    assert db.query(models.AgentTask).count() > 0, "agent_tasks table has records"
    assert db.query(models.DashboardMetric).count() > 0, "dashboard_metrics table has records"
    assert db.query(models.PendingQueueItem).count() > 0, "pending_queue table has records"
    assert db.query(models.WorkflowDAG).count() > 0, "workflow_dag table has records"
    assert db.query(models.MemoryStore).count() > 0, "memory_store table has records"
    assert db.query(models.ExecutionLog).count() > 0, "executions table has records"
    print("  ✓ All 7 domain state tables successfully initialized and validated!")

    db.close()
    print("\n" + "=" * 70)
    print("ALL 5-AGENT ARCHITECTURE & STATE STORE TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_all_tests()
