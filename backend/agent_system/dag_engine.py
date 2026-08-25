import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

import models
from .gemini_client import GeminiClient
from .agents import CEOAgent, HiringAgent, MarketingAgent, FinanceAgent, LegalAgent

class DAGEngine:
    """
    Coordinates multi-agent DAG workflow execution, step sequencing,
    context propagation, and state recording into SQLite tables.
    """
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.agents = {
            "CEO": CEOAgent(gemini_client),
            "HIRING": HiringAgent(gemini_client),
            "MARKETING": MarketingAgent(gemini_client),
            "FINANCE": FinanceAgent(gemini_client),
            "LEGAL": LegalAgent(gemini_client)
        }

    def execute_workflow(
        self,
        db: Session,
        prompt: str,
        user_id: Optional[int] = None,
        parent_task_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Runs CEO decomposition, builds the DAG graph in workflow_dag,
        and sequentially/dependently executes each agent step.
        """
        workflow_id = f"wf_{uuid.uuid4().hex[:10]}"
        
        # 1. Step 1: Run CEO Agent to decompose the goal
        ceo_agent = self.agents["CEO"]
        ceo_result = ceo_agent.execute(prompt)
        
        # Save CEO task record
        ceo_task = models.AgentTask(
            task_id=parent_task_id,
            user_id=user_id,
            agent_name="CEO",
            intent="STRATEGIC_DECOMPOSITION",
            input_prompt=prompt,
            status="COMPLETED",
            result_summary=ceo_result.get("result_summary", ""),
            artifact_payload=json.dumps(ceo_result.get("artifact_payload", {})),
            tokens_used=ceo_result.get("tokens_used", 0),
            execution_time_ms=ceo_result.get("execution_time_ms", 0)
        )
        db.add(ceo_task)
        db.commit()
        db.refresh(ceo_task)

        # 2. Extract DAG steps from CEO plan
        dag_plan = ceo_result.get("artifact_payload", {}).get("execution_dag", [])
        if not dag_plan:
            # Fallback standard 4-agent DAG
            dag_plan = [
                {"step_order": 1, "agent": "Finance", "responsibility": "Validate budget & runway", "dependencies": []},
                {"step_order": 2, "agent": "Marketing", "responsibility": "Generate GTM & social campaign", "dependencies": ["Finance"]},
                {"step_order": 3, "agent": "Hiring", "responsibility": "Draft JD & interview workflow", "dependencies": ["Finance"]},
                {"step_order": 4, "agent": "Legal", "responsibility": "Draft contract & IP assignment", "dependencies": ["Hiring"]}
            ]

        # 3. Insert DAG steps into workflow_dag table
        dag_records = []
        for step in dag_plan:
            dag_rec = models.WorkflowDAG(
                workflow_id=workflow_id,
                parent_task_id=parent_task_id,
                step_order=step.get("step_order", 1),
                agent_name=str(step.get("agent", "CEO")).upper(),
                dependencies=json.dumps(step.get("dependencies", [])),
                status="WAITING",
                input_context=json.dumps({"founder_prompt": prompt}),
                output_result="{}"
            )
            db.add(dag_rec)
            dag_records.append(dag_rec)
        db.commit()

        # 4. Execute Steps in Order
        cumulative_context: Dict[str, Any] = {
            "initial_prompt": prompt,
            "ceo_plan": ceo_result.get("artifact_payload", {})
        }
        
        executed_steps = []
        for dag_rec in dag_records:
            agent_key = dag_rec.agent_name.upper()
            if agent_key not in self.agents:
                agent_key = "CEO"

            agent_instance = self.agents[agent_key]
            dag_rec.status = "IN_PROGRESS"
            db.commit()

            step_start = time.time()
            step_prompt = f"{prompt} (Responsibility: {step.get('responsibility', 'Execute domain duties')})"
            
            try:
                result = agent_instance.execute(step_prompt, context=cumulative_context)
                step_duration = int((time.time() - step_start) * 1000)

                # Update DAG Record
                dag_rec.status = "COMPLETED"
                dag_rec.output_result = json.dumps(result.get("artifact_payload", {}))
                dag_rec.completed_at = datetime.utcnow()

                # Add to cumulative context for downstream agents
                cumulative_context[agent_key.lower()] = result.get("artifact_payload", {})

                # Persist to agent_tasks table
                agent_task_rec = models.AgentTask(
                    task_id=parent_task_id,
                    user_id=user_id,
                    agent_name=agent_key,
                    intent=result.get("intent", f"{agent_key}_EXECUTION"),
                    input_prompt=step_prompt,
                    status="COMPLETED",
                    result_summary=result.get("result_summary", ""),
                    artifact_payload=json.dumps(result.get("artifact_payload", {})),
                    tokens_used=result.get("tokens_used", 0),
                    execution_time_ms=step_duration
                )
                db.add(agent_task_rec)

                # Persist to executions log table
                exec_log = models.ExecutionLog(
                    task_id=parent_task_id,
                    user_id=user_id,
                    agent_name=agent_key,
                    step_name=f"DAG Step {dag_rec.step_order}: {agent_key}",
                    status="SUCCESS",
                    duration_ms=step_duration,
                    tokens_consumed=result.get("tokens_used", 0),
                    log_details=json.dumps({"summary": result.get("result_summary", "")})
                )
                db.add(exec_log)
                db.commit()

                executed_steps.append({
                    "step_order": dag_rec.step_order,
                    "agent_name": agent_key,
                    "status": "COMPLETED",
                    "summary": result.get("result_summary", ""),
                    "artifact": result.get("artifact_payload", {})
                })

            except Exception as e:
                dag_rec.status = "FAILED"
                db.commit()
                exec_log = models.ExecutionLog(
                    task_id=parent_task_id,
                    user_id=user_id,
                    agent_name=agent_key,
                    step_name=f"DAG Step {dag_rec.step_order}: {agent_key}",
                    status="ERROR",
                    duration_ms=int((time.time() - step_start) * 1000),
                    log_details=json.dumps({"error": str(e)})
                )
                db.add(exec_log)
                db.commit()

        return {
            "workflow_id": workflow_id,
            "goal": prompt,
            "status": "COMPLETED",
            "ceo_synthesis": ceo_result.get("artifact_payload", {}),
            "steps": executed_steps,
            "created_at": datetime.utcnow().isoformat()
        }
