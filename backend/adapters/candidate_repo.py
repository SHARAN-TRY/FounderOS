from typing import List, Dict, Any

class MockCandidateRepository:
    """
    Candidate repository interface for ATS (Greenhouse, Lever, Ashby) integrations.
    Provides realistic candidate ranking and scoring based on the evaluated role.
    """
    @staticmethod
    def screen_and_rank_candidates(role: str, criteria: str = "Intern / Fresher", salary_band: str = "₹8,000 – ₹10,000 / month") -> List[Dict[str, Any]]:
        role_lower = role.lower()
        if any(k in role_lower for k in ["front", "react", "ui", "web", "developer", "engineer", "software", "intern"]):
            return [
                {
                    "id": "cand_01",
                    "name": "Rahul Sharma",
                    "match_score": 94,
                    "status": "Interview Recommended",
                    "experience": "Final Year B.Tech (CS) / Active Open Source Contributor",
                    "current_company": "Apex Student Dev Club (Tech Lead)",
                    "core_skills": ["React 18", "TypeScript", "Tailwind CSS", "Next.js", "Zustand"],
                    "github_summary": "Top 5% open-source contributor; created React components library with 1.8k stars and 15+ live projects",
                    "expected_salary": "₹10,000 / month",
                    "notice_period": "Immediate (Available full-time 40h/week)",
                    "interview_recommendation": "Strong Hire - Exceptional UI component velocity and rapid learning agility."
                },
                {
                    "id": "cand_02",
                    "name": "Ananya Rao",
                    "match_score": 91,
                    "status": "Interview Recommended",
                    "experience": "3rd Year B.Tech / Frontend Intern",
                    "current_company": "Campus Hackathon Winner 2025",
                    "core_skills": ["React", "TypeScript", "REST APIs", "Vite", "Responsive Design"],
                    "github_summary": "Built 4 production web dashboards for campus startups with 60fps clean responsive layouts",
                    "expected_salary": "₹9,000 / month",
                    "notice_period": "Immediate",
                    "interview_recommendation": "Strong Hire - Clean coding habits, great attention to detail, highly motivated."
                },
                {
                    "id": "cand_03",
                    "name": "Arjun Kumar",
                    "match_score": 78,
                    "status": "Review",
                    "experience": "Self-Taught Web Developer (6 months project experience)",
                    "current_company": "Freelance Web Builder",
                    "core_skills": ["JavaScript", "React", "HTML5/CSS3", "Git"],
                    "github_summary": "Solid portfolio of interactive landing pages, fast learner",
                    "expected_salary": "₹8,000 / month",
                    "notice_period": "Immediate",
                    "interview_recommendation": "Potential Hire - Good UI styling foundation, ready for mentor-guided tasks."
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
