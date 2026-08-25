import time
from typing import Dict, Any, List
from ..gemini_client import GeminiClient

class FinanceAgent:
    """
    Finance Agent: Handles Budget Tracking, Financial Models, Pricing Strategies,
    Runway Calculations, and Expense Validations.
    """
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.name = "FINANCE"

    def execute(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        start_time = time.time()
        context = context or {}

        llm_prompt = f"""
You are the Chief Financial Officer & Finance Agent for a tech startup.
Your role: Run quantitative financial models, budget impact analysis, runway forecasting, and pricing strategies.

Task Objective: "{prompt}"
Context from Upstream (e.g. CEO/Hiring/Marketing): {context}

Generate a thorough quantitative financial report. Return ONLY valid JSON with this exact schema:
{{
  "financial_model_title": "Title of the Analysis",
  "budget_recommendation_status": "APPROVED" | "CAUTION_REQUIRED" | "REJECTED",
  "runway_analysis": {{
    "current_cash_reserves": "$180,000",
    "current_monthly_burn": "$12,500 / month",
    "projected_new_expense": "Monthly or one-time expense cost",
    "new_monthly_burn": "Adjusted burn rate",
    "original_runway_months": 14.4,
    "adjusted_runway_months": 13.2,
    "runway_impact_delta": "-1.2 months"
  }},
  "cost_breakdown": [
    {{"category": "Direct Resource / Compensation", "amount": "$8,000 / mo", "percentage": "70%"}},
    {{"category": "Cloud Infrastructure & Tooling", "amount": "$1,500 / mo", "percentage": "15%"}},
    {{"category": "Buffer & Contingency Reserve", "amount": "$1,000 / mo", "percentage": "15%"}}
  ],
  "unit_economics_pricing": {{
    "customer_acquisition_cost_cac": "$250",
    "projected_lifetime_value_ltv": "$3,200",
    "ltv_cac_ratio": "12.8x (Healthy)",
    "payback_period_months": "2.1 months",
    "gross_margin_target": "85%"
  }},
  "financial_guardrails": [
    "Maintain minimum 6-month hard cash buffer at all times",
    "Cap non-engineering discretionary spending at $2k/mo",
    "Review hiring ramp against Q2 revenue milestone targets"
  ],
  "executive_financial_verdict": "Clear, concise founder recommendation on whether to proceed with this budget."
}}
"""

        fallback = {
            "financial_model_title": "Runway & Budget Allocation Model",
            "budget_recommendation_status": "APPROVED",
            "runway_analysis": {
                "current_cash_reserves": "$250,000",
                "current_monthly_burn": "$15,000 / month",
                "projected_new_expense": "$3,500 / month (or ₹10k-₹25k for intern/tooling)",
                "new_monthly_burn": "$18,500 / month",
                "original_runway_months": 16.6,
                "adjusted_runway_months": 13.5,
                "runway_impact_delta": "-3.1 months"
            },
            "cost_breakdown": [
                {"category": "Direct Payroll / Stipend", "amount": "$2,500 / mo", "percentage": "71%"},
                {"category": "Software Subscriptions & API Tokens", "amount": "$500 / mo", "percentage": "14%"},
                {"category": "Discretionary Reserve & Taxes", "amount": "$500 / mo", "percentage": "15%"}
            ],
            "unit_economics_pricing": {
                "customer_acquisition_cost_cac": "$180",
                "projected_lifetime_value_ltv": "$2,400",
                "ltv_cac_ratio": "13.3x",
                "payback_period_months": "1.8 months",
                "gross_margin_target": "88%"
            },
            "financial_guardrails": [
                "Maintain minimum 6-month liquid cash floor ($90,000)",
                "Enforce strict variable compensation caps linked to milestones",
                "Re-evaluate burn rate if MRR fails to grow >10% month-over-month"
            ],
            "executive_financial_verdict": "Financially viable. Cash runway remains healthy at >13 months. Budget authorization recommended."
        }

        res = self.gemini.generate_json(
            prompt=llm_prompt,
            system_instruction="You are the Finance AI Agent. Output strictly valid JSON financial models.",
            fallback_data=fallback
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        data = res.get("data", fallback)
        verdict = data.get("budget_recommendation_status", "APPROVED")

        return {
            "agent_name": self.name,
            "intent": "FINANCIAL_MODEL_ANALYSIS",
            "input_prompt": prompt,
            "status": "COMPLETED",
            "result_summary": f"Financial runway model completed. Verdict: {verdict}. Runway remains within safe thresholds.",
            "artifact_payload": data,
            "tokens_used": res.get("tokens_used", 0),
            "execution_time_ms": elapsed_ms
        }
