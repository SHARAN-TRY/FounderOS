import os

social_code = '''import time
from typing import Dict, Any

class MockSocialAdapter:
    @staticmethod
    def generate_recruitment_posts(role: str, salary_info: str = "₹6L - ₹9L / year", criteria: str = "3+ years experience") -> Dict[str, Any]:
        linkedin_post = f"""🚀 We are hiring a {role} at FounderOS!

We are expanding our core team to build the autonomous AI executive workforce for founders worldwide.

✨ What you will work on:
• Architecting ultra-fast, resilient interfaces with React and TypeScript
• Working directly with our autonomous AI backend pipeline
• High ownership, zero bureaucracy, rapid deployment cycles

💰 Compensation: {salary_info} + Generous Founder Equity
📍 Location: Remote / Hybrid
⚡ Experience: {criteria}

👉 Interested? Apply directly or DM with your portfolio/GitHub!"""

        telegram_post = f"""🔥 HIRING ALERT: {role} @ FounderOS

• Role: {role}
• Compensation: {salary_info} + Equity
• Stack: React, TypeScript, Tailwind, REST APIs
• Work Mode: Remote / Flexible

Apply via DM @FounderOS_Talent or reply to this message."""

        return {
            "role": role,
            "salary_info": salary_info,
            "linkedin_post": linkedin_post,
            "telegram_post": telegram_post,
            "twitter_post": f"We just opened a {role} role at @FounderOS ({salary_info} + equity). DM your GitHub/portfolio if you love building AI-powered systems! RTs appreciated 🚀",
            "recommended_channels": ["LinkedIn Talent Solutions", "Telegram Dev Hub", "X Tech Community", "Wellfound"]
        }

    @staticmethod
    def publish_linkedin(content: str) -> Dict[str, Any]:
        return {
            "platform": "LinkedIn",
            "status": "PUBLISHED",
            "post_id": f"urn:li:share:{int(time.time())}",
            "live_url": "https://www.linkedin.com/feed/update/urn:li:share:719829410",
            "published_at": time.strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    @staticmethod
    def publish_telegram(content: str, channel: str = "@FounderOS_Announcements") -> Dict[str, Any]:
        return {
            "platform": "Telegram",
            "status": "BROADCASTED",
            "channel": channel,
            "message_id": int(time.time()) % 100000,
            "published_at": time.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
'''

candidate_code = '''from typing import List, Dict, Any

class MockCandidateRepository:
    """
    Candidate repository interface for ATS (Greenhouse, Lever, Ashby) integrations.
    Provides realistic candidate ranking and scoring based on the evaluated role.
    """
    @staticmethod
    def screen_and_rank_candidates(role: str, criteria: str = "3+ years", salary_band: str = "₹6L - ₹9L") -> List[Dict[str, Any]]:
        role_lower = role.lower()
        if any(k in role_lower for k in ["front", "react", "ui", "web", "developer", "engineer", "software"]):
            return [
                {
                    "id": "cand_01",
                    "name": "Rahul Sharma",
                    "match_score": 94,
                    "status": "Interview Recommended",
                    "experience": "4.5 years",
                    "current_company": "HyperScale Labs",
                    "core_skills": ["React 18", "TypeScript", "Tailwind CSS", "Next.js", "Redux/Zustand"],
                    "github_summary": "Top 5% open-source contributor; created widely used React animation library (2.4k stars)",
                    "expected_salary": "₹8.5L / year",
                    "notice_period": "Immediate (15 days)",
                    "interview_recommendation": "Strong Hire - Outstanding frontend systems design and UI component velocity."
                },
                {
                    "id": "cand_02",
                    "name": "Ananya Rao",
                    "match_score": 91,
                    "status": "Interview Recommended",
                    "experience": "3.8 years",
                    "current_company": "FinTech Matrix",
                    "core_skills": ["React", "TypeScript", "GraphQL", "WebSockets", "Vite"],
                    "github_summary": "Architected low-latency trader dashboard with 60fps real-time data streaming",
                    "expected_salary": "₹9.0L / year",
                    "notice_period": "30 days",
                    "interview_recommendation": "Strong Hire - Deep performance optimization and API integration expertise."
                },
                {
                    "id": "cand_03",
                    "name": "Arjun Kumar",
                    "match_score": 73,
                    "status": "Review",
                    "experience": "2.5 years",
                    "current_company": "DigitalCraft Agency",
                    "core_skills": ["JavaScript", "React", "HTML/CSS", "Bootstrap"],
                    "github_summary": "Solid portfolio of client landing pages and e-commerce frontends",
                    "expected_salary": "₹6.5L / year",
                    "notice_period": "Immediate",
                    "interview_recommendation": "Potential Hire - Good styling skills, requires mentorship on complex state management."
                }
            ]
        elif any(k in role_lower for k in ["market", "growth", "lead"]):
            return [
                {
                    "id": "cand_11",
                    "name": "Pooja Verma",
                    "match_score": 93,
                    "status": "Interview Recommended",
                    "experience": "5.0 years",
                    "current_company": "SaaS ScaleX",
                    "core_skills": ["Product-Led Growth", "LinkedIn Inbound", "Performance Ads", "HubSpot"],
                    "github_summary": "Grew B2B SaaS ARR from $200k to $1.8M via viral content loops",
                    "expected_salary": "₹9.5L / year",
                    "notice_period": "Immediate",
                    "interview_recommendation": "Strong Hire - Proven organic distribution and founder storytelling playbook."
                },
                {
                    "id": "cand_12",
                    "name": "Vikram Sethi",
                    "match_score": 85,
                    "status": "Interview Recommended",
                    "experience": "3.2 years",
                    "current_company": "GrowthPad",
                    "core_skills": ["SEO Optimization", "Community Building", "Email Nurturing"],
                    "github_summary": "Managed 45k+ member developer community and technical newsletter",
                    "expected_salary": "₹7.5L / year",
                    "notice_period": "15 days",
                    "interview_recommendation": "Solid Hire - High output on developer marketing."
                }
            ]
        else:
            return [
                {
                    "id": "cand_21",
                    "name": "Siddharth Mehta",
                    "match_score": 92,
                    "status": "Interview Recommended",
                    "experience": "4.0 years",
                    "current_company": "Apex Dynamics",
                    "core_skills": [f"{role} Mastery", "System Design", "Agile Execution"],
                    "github_summary": "Proven track record delivering mission-critical startup objectives",
                    "expected_salary": salary_band,
                    "notice_period": "Immediate",
                    "interview_recommendation": "Strong Hire - Exceptional domain problem solving."
                }
            ]
'''

doc_code = '''import time
from typing import Dict, Any

class MockDocumentService:
    """
    Document Generation & E-Signature Service (DocuSign / HelloSign / PandaDoc ready).
    """
    @staticmethod
    def generate_offer_letter(candidate_name: str, role: str, compensation: str = "₹9,00,000 / year", start_date: str = "First Monday of next month") -> Dict[str, Any]:
        document_id = f"OFFER-FOS-{int(time.time()) % 100000}"
        
        offer_text = f"""FOUNDEROS TECHNOLOGIES PVT. LTD.
CONFIDENTIAL EMPLOYMENT OFFER LETTER

Date: {time.strftime('%B %d, %Y')}

To: {candidate_name}
Position: {role}
Reporting to: Founder & CEO, FounderOS

Dear {candidate_name},

We are thrilled to offer you the full-time position of {role} at FounderOS.

1. COMPENSATION & BENEFITS:
• Annual Base CTC: {compensation}
• Performance Incentive: Up to 10% annual milestone bonus
• Employee Stock Options (ESOP): Subject to standard 4-year vesting with 1-year cliff
• Comprehensive Health & Medical Insurance coverage
• Home Office & Tech Equipment Stipend: ₹1,50,000 upfront

2. KEY TERMS & COMPLIANCE:
• Proprietary Information and Inventions Assignment Agreement (100% IP rights assigned to FounderOS)
• Mutual Non-Disclosure Agreement (NDA)
• Standard 30-day notice period post probation

3. TARGET START DATE:
{start_date}

This offer is valid for 7 business days from the date of issuance."""

        return {
            "document_id": document_id,
            "document_type": "EMPLOYMENT_OFFER_LETTER",
            "candidate_name": candidate_name,
            "role": role,
            "compensation": compensation,
            "status": "AWAITING_FOUNDER_SIGN_AND_SEND",
            "offer_text": offer_text,
            "key_clauses": [
                "100% Intellectual Property (IP) Assignment to FounderOS",
                "Strict Non-Disclosure of Proprietary AI Models & Codebases",
                "Non-Solicitation & Non-Compete Standard Covenants",
                "Remote Work Security & Data Protection Addendum"
            ],
            "actions_available": [
                {"id": "approve_send_offer", "name": "APPROVE & SEND OFFER VIA EMAIL", "target": candidate_name, "consequential": True},
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
'''

init_code = '''from .finance_service import MockFinanceService
from .social_adapter import MockSocialAdapter
from .candidate_repo import MockCandidateRepository
from .document_service import MockDocumentService

__all__ = [
    "MockFinanceService",
    "MockSocialAdapter",
    "MockCandidateRepository",
    "MockDocumentService"
]
'''

with open('backend/adapters/social_adapter.py', 'w', encoding='utf-8') as f:
    f.write(social_code)
with open('backend/adapters/candidate_repo.py', 'w', encoding='utf-8') as f:
    f.write(candidate_code)
with open('backend/adapters/document_service.py', 'w', encoding='utf-8') as f:
    f.write(doc_code)
with open('backend/adapters/__init__.py', 'w', encoding='utf-8') as f:
    f.write(init_code)

print("All adapters created successfully!")