import time
from typing import Dict, Any, List
from ..gemini_client import GeminiClient

class HiringAgent:
    """
    Hiring Agent: Handles Job Descriptions, Talent Sourcing Pipelines, Candidate Profiles,
    Interview Workflows, and Recruitment Communications.
    """
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.name = "HIRING"

    def execute(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        start_time = time.time()
        context = context or {}

        llm_prompt = f"""
You are the expert Talent Acquisition & Hiring Agent for an elite tech startup.
Your role: Generate end-to-end recruitment pipelines, role specifications, interview rubrics, and candidate outreach.

Task Objective: "{prompt}"
Context from Upstream (e.g. Budget/CEO): {context}

Generate an exhaustive recruitment package. Return ONLY valid JSON with this exact schema:
{{
  "job_title": "Title of the Role",
  "department": "Engineering" | "Product" | "Growth" | "Operations",
  "seniority": "Intern" | "Junior" | "Mid-Level" | "Senior" | "Lead",
  "target_compensation": "Estimated salary or stipend range",
  "job_description": {{
    "overview": "Company mission and why this role matters",
    "core_responsibilities": [
      "Responsibility 1",
      "Responsibility 2",
      "Responsibility 3",
      "Responsibility 4"
    ],
    "must_have_qualifications": [
      "Qualification 1",
      "Qualification 2",
      "Qualification 3"
    ],
    "nice_to_have_skills": [
      "Skill 1",
      "Skill 2"
    ],
    "growth_and_perks": [
      "Perk 1",
      "Perk 2"
    ]
  }},
  "candidate_evaluation_rubric": [
    {{"criterion": "Technical Expertise", "weight": "40%", "indicators": "Clean code architecture, system design, modern tech stack"}},
    {{"criterion": "Execution Speed & Ownership", "weight": "30%", "indicators": "High velocity, bias for action, shipping mindset"}},
    {{"criterion": "Communication & Culture Fit", "weight": "30%", "indicators": "Direct communication, curiosity, founder alignment"}}
  ],
  "interview_workflow": [
    {{"stage": 1, "name": "Resume & GitHub Screen", "duration": "15 min", "focus": "Portfolio verification & relevant shipped projects"}},
    {{"stage": 2, "name": "Technical Problem Solving", "duration": "45 min", "focus": "Live coding or take-home architecture review"}},
    {{"stage": 3, "name": "Founder Alignment Chat", "duration": "30 min", "focus": "Mission, mindset, equity/compensation alignment"}}
  ],
  "outreach_templates": {{
    "linkedin_inmail": "Direct, high-converting outreach message to prospective talent",
    "cold_email_invite": "Subject and body for inviting a top-tier applicant",
    "polite_rejection_email": "Respectful rejection email maintaining founder goodwill"
  }},
  "sourcing_channels": [
    "GitHub Profiles & Open Source contributors",
    "Wellfound / AngelList Startup Talent Pool",
    "Twitter/X tech communities & specialized Discord servers"
  ]
}}
"""

        fallback = {
            "job_title": "Full Stack Engineer",
            "department": "Engineering",
            "seniority": "Mid-to-Senior",
            "target_compensation": "$90,000 - $130,000 / yr + Equity (or ₹10k-₹25k/mo for intern)",
            "job_description": {
                "overview": "Join our fast-moving startup team to architect high-performance web applications and agentic workflows.",
                "core_responsibilities": [
                    "Design, build, and deploy full-stack features using modern frameworks (FastAPI, React/Next.js, TypeScript)",
                    "Integrate real-time multi-agent workflows and autonomous pipeline orchestrators",
                    "Optimize database queries, API latency, and front-end render performance",
                    "Collaborate directly with founders to iterate on product specs and customer feedback"
                ],
                "must_have_qualifications": [
                    "Strong proficiency in Python (FastAPI/SQLAlchemy) and TypeScript/React",
                    "Demonstrated track record of shipping end-to-end web applications",
                    "Solid understanding of relational databases (PostgreSQL/SQLite) and state machines"
                ],
                "nice_to_have_skills": [
                    "Experience with LLM APIs, prompt orchestration, and autonomous agent loops",
                    "Familiarity with TailwindCSS, Vite, and containerized deployments"
                ],
                "growth_and_perks": [
                    "Competitive compensation with high-upside equity package",
                    "Direct mentorship from founding team with rapid leadership career trajectory",
                    "Flexible remote setup and home office stipend"
                ]
            },
            "candidate_evaluation_rubric": [
                {"criterion": "Technical Architecture & Code Quality", "weight": "40%", "indicators": "Clean abstractions, robust error handling, schema design"},
                {"criterion": "Execution Velocity & Problem Solving", "weight": "35%", "indicators": "Ability to unblock oneself, fast prototyping, pragmatic choices"},
                {"criterion": "Culture & Communication", "weight": "25%", "indicators": "Clear asynchronous communication, radical ownership, high energy"}
            ],
            "interview_workflow": [
                {"stage": 1, "name": "Async Screening & Code Review", "duration": "15 min", "focus": "Review GitHub repositories, previous projects, and baseline skills"},
                {"stage": 2, "name": "Technical Deep Dive", "duration": "45 min", "focus": "System architecture, live problem breakdown, and API design"},
                {"stage": 3, "name": "Founder Culture & Offer Discussion", "duration": "30 min", "focus": "Vision alignment, role expectations, and offer negotiation"}
            ],
            "outreach_templates": {
                "linkedin_inmail": "Hi [Name], I came across your impressive work on [Project/Repo]. We're building FounderOS (an autonomous multi-agent operating system) and looking for an exceptional engineer to lead core workflows. Would love to share what we're building!",
                "cold_email_invite": "Subject: Building the future of autonomous startup operations - Quick chat?\n\nHi [Name],\n\nYour background in [Skill] caught our eye. We're assembling an elite founding engineering team. Let's do a quick 15-minute intro this week.",
                "polite_rejection_email": "Subject: Update on your application\n\nHi [Name],\n\nThank you for taking the time to speak with us. While we are proceeding with another candidate whose background aligns more closely with our current sprint priorities, we were very impressed by your experience and hope to stay connected."
            },
            "sourcing_channels": [
                "GitHub Talent & Repo Contributors",
                "Wellfound (AngelList) Talent",
                "Startup Engineering Discords & Twitter"
            ]
        }

        res = self.gemini.generate_json(
            prompt=llm_prompt,
            system_instruction="You are the Hiring AI Agent. Output strictly valid JSON recruitment deliverables.",
            fallback_data=fallback
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        data = res.get("data", fallback)
        role = data.get("job_title", "Candidate")

        return {
            "agent_name": self.name,
            "intent": "HIRING_PIPELINE_GENERATION",
            "input_prompt": prompt,
            "status": "COMPLETED",
            "result_summary": f"Completed recruitment pipeline, job description, and interview rubric for {role}.",
            "artifact_payload": data,
            "tokens_used": res.get("tokens_used", 0),
            "execution_time_ms": elapsed_ms
        }
