import time
from typing import Dict, Any, List
from ..gemini_client import GeminiClient

class CEOAgent:
    """
    CEO Agent: Master Orchestrator, High-Level Strategic Analyzer, Task Decomposer,
    Dependency Planner (DAG), and Priority Router.
    """
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.name = "CEO"

    def execute(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        start_time = time.time()
        context = context or {}

        llm_prompt = f"""
You are the CEO Agent for a fast-growing startup.
Your role: High-Level Strategic Analyzer, Task Decomposer, Dependency Planner, and Master Orchestrator.

Analyze this founder objective: "{prompt}"
Additional Context: {context}

Generate a comprehensive strategic execution plan and dependency DAG across the 5 domains (CEO, Hiring, Marketing, Finance, Legal).
Return ONLY valid JSON with this exact schema:
{{
  "executive_summary": "High-level strategic diagnosis and execution thesis",
  "priority_level": "P0 - Critical" | "P1 - High" | "P2 - Medium",
  "strategic_pillars": [
    "Pillar 1 description",
    "Pillar 2 description",
    "Pillar 3 description"
  ],
  "risk_assessment": [
    {{"risk": "Risk description", "severity": "High" | "Medium" | "Low", "mitigation": "Mitigation strategy"}}
  ],
  "execution_dag": [
    {{
      "step_order": 1,
      "agent": "Finance" | "Marketing" | "Hiring" | "Legal" | "CEO",
      "responsibility": "Precise responsibility for this step",
      "dependencies": [],
      "expected_deliverables": ["Deliverable 1", "Deliverable 2"]
    }}
  ],
  "success_metrics_kpis": [
    {{"metric": "Metric name", "target": "Target value", "timeline": "Timeline"}}
  ],
  "recommended_next_action": "Immediate tactical command to trigger"
}}
"""

        fallback = {
            "executive_summary": f"Strategic decomposition for objective: '{prompt}'. Deconstructed into phased execution across specialized agents.",
            "priority_level": "P1 - High",
            "strategic_pillars": [
                "1. Capital efficiency & budget validation before commitment",
                "2. Rapid go-to-market and distribution pipeline execution",
                "3. Talent acquisition & contractual risk mitigation"
            ],
            "risk_assessment": [
                {"risk": "Budget overrun & cash burn acceleration", "severity": "High", "mitigation": "Enforce strict financial caps with Finance Agent model"},
                {"risk": "Delayed candidate onboarding", "severity": "Medium", "mitigation": "Automate JD and sourcing rubrics with Hiring Agent"},
                {"risk": "Regulatory or IP ownership ambiguity", "severity": "Medium", "mitigation": "Enforce standard IP assignment with Legal Agent"}
            ],
            "execution_dag": [
                {
                    "step_order": 1,
                    "agent": "Finance",
                    "responsibility": "Validate cash reserves, model runway impact, and approve budget limits.",
                    "dependencies": [],
                    "expected_deliverables": ["Runway burn impact analysis", "Approved budget ceiling"]
                },
                {
                    "step_order": 2,
                    "agent": "Marketing",
                    "responsibility": "Design campaign announcement, social media distribution, and community outreach.",
                    "dependencies": ["Finance"],
                    "expected_deliverables": ["Multi-channel copy (LinkedIn, Twitter)", "GTM launch calendar"]
                },
                {
                    "step_order": 3,
                    "agent": "Hiring",
                    "responsibility": "Generate comprehensive role specification, screening rubrics, and interview guides.",
                    "dependencies": ["Finance"],
                    "expected_deliverables": ["Standardized Job Description", "Candidate Evaluation Rubric"]
                },
                {
                    "step_order": 4,
                    "agent": "Legal",
                    "responsibility": "Draft compliance documents, employment/internship agreements, and IP assignment clauses.",
                    "dependencies": ["Hiring"],
                    "expected_deliverables": ["Enforceable Offer Letter", "IP Assignment & NDA Agreement"]
                }
            ],
            "success_metrics_kpis": [
                {"metric": "Execution Turnaround", "target": "< 48 hours", "timeline": "Immediate"},
                {"metric": "Budget Compliance", "target": "100% within approved limit", "timeline": "Q1"},
                {"metric": "Operational Velocity", "target": "3x pipeline output", "timeline": "30 days"}
            ],
            "recommended_next_action": "Authorize Finance and Marketing execution steps simultaneously."
        }

        res = self.gemini.generate_json(
            prompt=llm_prompt,
            system_instruction="You are the CEO AI Agent. Output strictly valid JSON strategic plans.",
            fallback_data=fallback
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        data = res.get("data", fallback)

        return {
            "agent_name": self.name,
            "intent": "STRATEGIC_DECOMPOSITION",
            "input_prompt": prompt,
            "status": "COMPLETED",
            "result_summary": data.get("executive_summary", "CEO strategic analysis finalized."),
            "artifact_payload": data,
            "tokens_used": res.get("tokens_used", 0),
            "execution_time_ms": elapsed_ms
        }
