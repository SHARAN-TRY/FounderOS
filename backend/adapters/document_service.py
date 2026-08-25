import time
from typing import Dict, Any

class MockDocumentService:
    """
    Document Generation & E-Signature Service (DocuSign / HelloSign / PandaDoc ready).
    """
    @staticmethod
    def generate_offer_letter(candidate_name: str, role: str, compensation: str = "₹10,000 / month", start_date: str = "Immediate / 1st of next month") -> Dict[str, Any]:
        document_id = f"INTERN-OFFER-{int(time.time()) % 100000}"
        intern_role = role if "intern" in role.lower() else f"{role} Intern"
        
        offer_text = f"""FOUNDEROS TECHNOLOGIES PVT. LTD.
CONFIDENTIAL INTERNSHIP OFFER & ENGAGEMENT LETTER

Date: {time.strftime('%B %d, %Y')}

To: {candidate_name}
Position: {intern_role}
Reporting to: Founder & CEO, FounderOS

Dear {candidate_name},

We are pleased to offer you an internship position as {intern_role} at FounderOS.

1. STIPEND & ENGAGEMENT DETAILS:
• Monthly Fixed Stipend: {compensation} (paid on the 1st of each calendar month)
• Internship Duration: 3 Months (with option to extend or convert to Pre-Placement Offer based on performance)
• Working Mode: Remote / Flexible (40 hours per week)
• Certificate of Internship and Founder Letter of Recommendation upon completion

2. INTELLECTUAL PROPERTY & CONFIDENTIALITY:
• Proprietary Information and Inventions Assignment Agreement (100% of code, designs, and workflows belong to FounderOS)
• Strict Non-Disclosure Agreement (NDA) regarding FounderOS AI models and internal strategies
• Standard Code of Conduct & Cyber Security protocols

3. START DATE & ONBOARDING:
• Target Start Date: {start_date}
• Access to FounderOS GitHub repository, Notion workspace, and Slack channels will be granted upon signing.

This offer remains valid for 5 business days from issuance."""

        return {
            "document_id": document_id,
            "document_type": "INTERNSHIP_OFFER_LETTER",
            "candidate_name": candidate_name,
            "role": intern_role,
            "compensation": compensation,
            "status": "AWAITING_FOUNDER_SIGN_AND_SEND",
            "offer_text": offer_text,
            "key_clauses": [
                "100% Intellectual Property (IP) Assignment to FounderOS",
                "Strict NDA covering FounderOS Autonomous AI Codebase",
                "Fixed ₹10,000/month stipend with Pre-Placement Offer (PPO) review",
                "Remote Work, Cyber Security & Data Privacy Compliance"
            ],
            "actions_available": [
                {"id": "approve_send_offer", "name": "APPROVE & SEND INTERN OFFER VIA EMAIL", "target": candidate_name, "consequential": True},
                {"id": "download_pdf", "name": "DOWNLOAD SIGNED PDF", "target": document_id, "consequential": False}
            ]
        }

    @staticmethod
    def dispatch_docusign_envelope(document_id: str, recipient_name: str, recipient_email: str = "candidate@example.com") -> Dict[str, Any]:
        return {
            "envelope_id": f"DOCUSIGN-ENV-{int(time.time())}",
            "document_id": document_id,
            "recipient": recipient_name,
            "email": recipient_email,
            "status": "DISPATCHED_FOR_SIGNATURE",
            "sent_at": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "tracking_url": "https://demo.docusign.net/signing/envelopes/8f9a2b1c"
        }
