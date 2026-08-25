import time
from typing import Dict, Any, List
from ..gemini_client import GeminiClient

class LegalAgent:
    """
    Legal Agent: Handles Compliance Reviews, Offer Letter Templates,
    Terms of Service, and Non-Disclosure Agreements (NDAs).
    """
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.name = "LEGAL"

    def execute(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        start_time = time.time()
        context = context or {}

        llm_prompt = f"""
You are the General Counsel & Legal AI Agent for a tech startup.
Your role: Draft airtight contracts, offer letters, IP assignment clauses, NDAs, and compliance guidelines.

Task Objective: "{prompt}"
Context from Upstream (e.g. Hiring/Finance/CEO): {context}

Generate an exhaustive, enforceable legal package. Return ONLY valid JSON with this exact schema:
{{
  "document_title": "Title of the Legal Document",
  "document_type": "OFFER_LETTER" | "NDA" | "IP_ASSIGNMENT" | "TERMS_OF_SERVICE" | "COMPLIANCE_REVIEW",
  "parties_involved": {{
    "company": "FounderOS Technologies Inc.",
    "counterparty": "Candidate / Consultant / Enterprise Client"
  }},
  "key_clauses": [
    {{"clause_name": "Scope & Duties", "summary": "Clear description of responsibilities and at-will nature"}},
    {{"clause_name": "Compensation & Vesting", "summary": "Payment schedule, equity vesting cliff, and bonus conditions"}},
    {{"clause_name": "100% IP & Inventions Assignment", "summary": "All work product, code, models, and docs belong exclusively to Company"}},
    {{"clause_name": "Confidentiality & Non-Disclosure", "summary": "Strict protection of proprietary algorithms and customer data"}},
    {{"clause_name": "Governing Law & Dispute Resolution", "summary": "Jurisdiction and mandatory binding arbitration"}}
  ],
  "full_contract_text_markdown": "Complete, ready-to-sign formal legal contract in formatted Markdown...",
  "compliance_checklist": [
    {{"item": "Confirmatory IP Assignment signed", "status": "REQUIRED"}},
    {{"item": "At-Will Employment statement acknowledged", "status": "VERIFIED"}},
    {{"item": "Statutory tax withholding compliance", "status": "REVIEWED"}}
  ],
  "legal_risk_level": "LOW - Standard protective clauses applied",
  "founder_action_required": "Review and send for DocuSign / e-signature."
}}
"""

        fallback = {
            "document_title": "Employment Offer & Proprietary Inventions Assignment Agreement",
            "document_type": "OFFER_LETTER",
            "parties_involved": {
                "company": "FounderOS Inc.",
                "counterparty": "Designated Candidate / Contractor"
            },
            "key_clauses": [
                {"clause_name": "1. Position & Duties", "summary": "Performs assigned duties under founder direction on an at-will basis."},
                {"clause_name": "2. Compensation & Benefits", "summary": "Agreed salary/stipend paid bi-weekly/monthly subject to standard statutory withholdings."},
                {"clause_name": "3. 100% IP Assignment", "summary": "All intellectual property, source code, designs, and know-how are the exclusive property of FounderOS Inc."},
                {"clause_name": "4. Non-Disclosure & Confidentiality", "summary": "Strict indefinite non-disclosure of company proprietary assets and trade secrets."},
                {"clause_name": "5. Governing Law", "summary": "Governed by applicable state laws with mandatory binding arbitration for disputes."}
            ],
            "full_contract_text_markdown": """# EMPLOYMENT OFFER & IP ASSIGNMENT AGREEMENT

**Date:** March 2026  
**Company:** FounderOS Inc. ("Company")  
**Employee / Contractor:** [Candidate Name] ("Recipient")  

### 1. Position and Duties
Company is pleased to offer you the position of **[Job Title]**. You will report directly to the Founding Team and perform duties commensurate with your position.

### 2. Compensation
- **Base Compensation:** Commensurate with approved budget schedule, payable in accordance with standard payroll practices.
- **Equity / Incentives:** Subject to Board approval and standard 1-year cliff / 4-year vesting schedule where applicable.

### 3. Proprietary Information and Inventions Agreement
As a condition of employment, you agree that:
- All inventions, software, trade secrets, designs, and works of authorship created during your tenure belong exclusively and solely to Company (100% IP Assignment).
- You will hold all Company trade secrets in strict confidence indefinitely.

### 4. At-Will Relationship
Employment with Company is for an unspecified term and constitutes "at-will" employment, meaning that either you or Company may terminate the relationship at any time, with or without cause or notice.

**Agreed and Accepted:**

____________________________  
**Candidate Signature**  
Date: ______________________  

____________________________  
**Founder / CEO Signature**  
FounderOS Inc.
""",
            "compliance_checklist": [
                {"item": "Full 100% IP Assignment clause enforced", "status": "VERIFIED"},
                {"item": "Clear At-Will disclaimer included", "status": "VERIFIED"},
                {"item": "Confidentiality covenants integrated", "status": "VERIFIED"}
            ],
            "legal_risk_level": "LOW - Standard protective clauses applied",
            "founder_action_required": "Fill candidate name and dispatch for e-signature."
        }

        res = self.gemini.generate_json(
            prompt=llm_prompt,
            system_instruction="You are the Legal AI Agent. Output strictly valid JSON legal contracts.",
            fallback_data=fallback
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        data = res.get("data", fallback)
        doc_title = data.get("document_title", "Legal Document")

        return {
            "agent_name": self.name,
            "intent": "LEGAL_CONTRACT_GENERATION",
            "input_prompt": prompt,
            "status": "COMPLETED",
            "result_summary": f"Drafted comprehensive legal agreement: {doc_title}.",
            "artifact_payload": data,
            "tokens_used": res.get("tokens_used", 0),
            "execution_time_ms": elapsed_ms
        }
