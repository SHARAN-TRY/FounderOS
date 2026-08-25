import time
from typing import Dict, Any

class MockSocialAdapter:
    @staticmethod
    def generate_recruitment_posts(role: str, salary_info: str = "₹8,000 – ₹10,000 / month", criteria: str = "Passionate student / Fresher / Self-taught builder") -> Dict[str, Any]:
        intern_role = role if "intern" in role.lower() else f"{role} Intern"
        linkedin_post = f"""🚀 We are hiring a {intern_role} at FounderOS!

We are an early-stage, fast-moving startup building the autonomous AI executive operating system for founders worldwide.

✨ What you will work on:
• Building production UI components with React, TypeScript & Tailwind CSS
• Collaborating directly with the Founder & AI Orchestration pipeline
• High ownership, rapid shipping cadence, real startup experience

💰 Stipend: {salary_info} + Certificate & Pre-Placement Offer (PPO) opportunity
📍 Location: Remote / Flexible
⚡ Eligibility: {criteria} (GitHub portfolio / personal projects prioritized)

👉 Interested? DM your GitHub/portfolio or comment below to get fast-tracked!"""

        telegram_post = f"""🔥 INTERNSHIP ALERT: {intern_role} @ FounderOS

• Role: {intern_role}
• Stipend: {salary_info} + PPO Potential
• Stack: React, TypeScript, Tailwind, REST APIs
• Work Mode: Remote / Flexible (3-6 Months)

Apply via DM @FounderOS_Talent with your GitHub profile!"""

        return {
            "role": intern_role,
            "salary_info": salary_info,
            "linkedin_post": linkedin_post,
            "telegram_post": telegram_post,
            "twitter_post": f"We're looking for a hungry {intern_role} to join our early startup team ({salary_info} + PPO). DM your GitHub/projects if you want to build AI systems! 🚀",
            "recommended_channels": ["LinkedIn Campus & Early Careers", "Telegram Developer Hubs", "X Dev Community", "Internshala / Wellfound"]
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
