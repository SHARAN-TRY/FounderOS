import re
import logging
from typing import Dict, Any, Tuple
from .gemini_client import GeminiClient
from .schemas import IntentClassification

logger = logging.getLogger(__name__)

class IntentRouter:
    """
    Analyzes user task input and routes it dynamically to the single most suitable
    domain agent (CEO, HIRING, MARKETING, FINANCE, LEGAL) or a multi-agent DAG.
    """
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client

    def classify(self, prompt: str) -> IntentClassification:
        """
        Classifies task intent using Gemini semantic classification with heuristic fallback.
        """
        # 1. Attempt LLM classification
        if self.gemini.is_configured():
            llm_prompt = f"""
You are the master routing engine for FounderOS.
Analyze the following founder request and classify it into EXACTLY ONE primary agent domain from:
- CEO (High-level strategy, multi-agent task planning, resource allocation, executive roadmaps)
- HIRING (Job descriptions, talent sourcing, candidate screening, interview question guides)
- MARKETING (Go-to-market strategies, campaign launch models, social media copy, promotional campaigns)
- FINANCE (Runway models, budget calculation, pricing strategies, cash flow analysis, expense validation)
- LEGAL (Contracts, NDAs, offer letters, Terms of Service, IP assignment, compliance reviews)

Return ONLY valid JSON matching this schema:
{{
  "domain": "CEO" | "HIRING" | "MARKETING" | "FINANCE" | "LEGAL",
  "confidence": 0.95,
  "reasoning": "string explaining routing decision",
  "recommended_mode": "DIRECT_AGENT" | "DAG_WORKFLOW",
  "entities": {{
     "role": "string or null",
     "budget": "string or null",
     "timeline": "string or null",
     "topic": "string or null"
  }}
}}

Founder Request: "{prompt}"
"""
            res = self.gemini.generate_json(
                prompt=llm_prompt,
                system_instruction="You are an autonomous intent classifier router. Always respond with strict JSON."
            )
            data = res.get("data", {})
            domain = str(data.get("domain", "")).upper()
            if domain in ["CEO", "HIRING", "MARKETING", "FINANCE", "LEGAL"]:
                return IntentClassification(
                    domain=domain,
                    confidence=float(data.get("confidence", 0.9)),
                    reasoning=str(data.get("reasoning", "Semantic routing via Gemini")),
                    recommended_mode=str(data.get("recommended_mode", "DIRECT_AGENT")),
                    entities=data.get("entities", {})
                )

        # 2. Heuristic deterministic fallback
        return self._heuristic_classify(prompt)

    def _heuristic_classify(self, prompt: str) -> IntentClassification:
        lower = prompt.lower()
        entities: Dict[str, Any] = {}

        # Extract budget
        budget_match = re.search(r'(\$[\d,]+k?|\b\d+\s*k\b|₹[\d,]+|\b\d+\s*lakhs?\b|budget\s*(?:of|is|:)?\s*[\$\₹\w\d,]+)', prompt, re.IGNORECASE)
        if budget_match:
            entities["budget"] = budget_match.group(0)

        # Extract role
        roles = [
            "frontend engineer", "backend engineer", "full stack developer", "software engineer",
            "intern", "product manager", "ui/ux designer", "marketing manager", "sales lead"
        ]
        for r in roles:
            if r in lower:
                entities["role"] = r.title()
                break

        # Scoring heuristics
        hiring_score = sum(k in lower for k in ["hire", "hiring", "recruit", "candidate", "job description", "talent", "interview", "resume", "sde", "engineer", "designer"])
        marketing_score = sum(k in lower for k in ["marketing", "market", "campaign", "social media", "linkedin", "twitter", "gtm", "go-to-market", "promo", "copy", "branding", "ad "])
        finance_score = sum(k in lower for k in ["finance", "financial", "budget", "runway", "cash burn", "revenue", "pricing", "cost", "expense", "valuation", "fundraise"])
        legal_score = sum(k in lower for k in ["legal", "contract", "nda", "agreement", "offer letter", "compliance", "terms of service", "tos", "privacy policy", "ip assignment"])
        ceo_score = sum(k in lower for k in ["strategy", "roadmap", "plan", "restructure", "launch product", "scale company", "orchestrate", "ceo", "priorities", "quarterly goal"])

        scores = {
            "HIRING": hiring_score,
            "MARKETING": marketing_score,
            "FINANCE": finance_score,
            "LEGAL": legal_score,
            "CEO": ceo_score
        }

        # Determine highest domain
        best_domain = max(scores, key=scores.get)
        max_score = scores[best_domain]

        # If multiple high domains or generic launch/goal, mark for DAG_WORKFLOW / CEO
        active_domains_count = sum(1 for s in scores.values() if s > 0)
        is_composite = active_domains_count >= 2 or best_domain == "CEO" or "launch" in lower or "expand" in lower

        if max_score == 0:
            best_domain = "CEO"
            reasoning = "General founder objective routed to CEO Orchestrator"
        else:
            reasoning = f"Matched keyword intent patterns for domain {best_domain}"

        return IntentClassification(
            domain=best_domain,
            confidence=0.85 if max_score > 0 else 0.6,
            reasoning=reasoning,
            recommended_mode="DAG_WORKFLOW" if is_composite else "DIRECT_AGENT",
            entities=entities
        )
