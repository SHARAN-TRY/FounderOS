import time
from typing import Dict, Any, List
from ..gemini_client import GeminiClient

class MarketingAgent:
    """
    Marketing Agent: Handles Go-To-Market Strategies, Campaign Launch Models,
    Social Media Copy (LinkedIn, Twitter/X, Telegram), and Promotional Content Generation.
    """
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        self.name = "MARKETING"

    def execute(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        start_time = time.time()
        context = context or {}

        llm_prompt = f"""
You are the expert Growth & Marketing Agent for a tech startup.
Your role: Architect Go-to-Market (GTM) campaigns, viral social media copy, launch announcements, and distribution playbooks.

Task Objective: "{prompt}"
Context from Upstream (e.g. Finance/Hiring/CEO): {context}

Generate a comprehensive marketing launch kit. Return ONLY valid JSON with this exact schema:
{{
  "campaign_name": "Title of the Campaign",
  "target_audience": "Primary persona and market segment",
  "core_value_proposition": "1-sentence undeniable value hook",
  "gtm_strategy": {{
    "launch_phases": [
      {{"phase": "Pre-Launch Tease (Day 1-3)", "action": "Build anticipation via founder teaser and beta invite"}},
      {{"phase": "Launch Day Blast (Day 4)", "action": "Synchronized release on Product Hunt, Twitter/X, and LinkedIn"}},
      {{"phase": "Post-Launch Retargeting (Day 5-10)", "action": "Customer proof, case studies, and feature deep-dives"}}
    ],
    "key_channels": ["LinkedIn", "Twitter/X", "Product Hunt", "Hacker News", "Telegram / Discord"]
  }},
  "social_media_assets": {{
    "linkedin_post": "Engaging, formatted LinkedIn post with line breaks, hooks, and call-to-action",
    "twitter_thread": [
      "Tweet 1 (The Hook): ...",
      "Tweet 2 (The Problem): ...",
      "Tweet 3 (The Solution/Demo): ...",
      "Tweet 4 (Key Benefits): ...",
      "Tweet 5 (The CTA & Link): ..."
    ],
    "telegram_discord_broadcast": "Direct broadcast message for community channels"
  }},
  "email_campaign": {{
    "subject_lines": ["Subject Option A", "Subject Option B", "Subject Option C"],
    "preview_text": "Engaging preview text",
    "body_markdown": "Complete formatted email copy ready to send via Mailchimp/Resend"
  }},
  "campaign_kpis": [
    {{"channel": "LinkedIn", "kpi": "Impressions", "target": "10,000+"}},
    {{"channel": "Twitter/X", "kpi": "Engagements & Bookmarks", "target": "500+"}},
    {{"channel": "Direct Inbound", "kpi": "Signups / Leads", "target": "100+"}}
  ]
}}
"""

        fallback = {
            "campaign_name": "Autonomous Operations Sprint Campaign",
            "target_audience": "Tech Founders, Engineering Leaders, and Early-stage Operators",
            "core_value_proposition": "Automate company operations, hiring, finance, and marketing with 5 specialized autonomous AI agents.",
            "gtm_strategy": {
                "launch_phases": [
                    {"phase": "Phase 1: Founder Tease", "action": "Post behind-the-scenes engineering demo on Twitter/X and LinkedIn."},
                    {"phase": "Phase 2: Public Release", "action": "Broadcast official launch copy across social media and developer communities."},
                    {"phase": "Phase 3: Proof & Case Studies", "action": "Publish customer workflows and ROI metrics."}
                ],
                "key_channels": ["LinkedIn", "Twitter/X", "Product Hunt", "Developer Communities"]
            },
            "social_media_assets": {
                "linkedin_post": "🚀 Running a startup shouldn't mean drowning in administrative overhead.\n\nToday, we're unveiling our autonomous 5-Agent Operating System:\n\n✨ CEO Agent - Strategic planning & task decomposition\n💼 Hiring Agent - 100% automated JD & candidate screening\n📈 Marketing Agent - Multi-channel GTM & viral copy\n💰 Finance Agent - Real-time runway & burn rate modeling\n⚖️ Legal Agent - Instant compliant contracts & offer letters\n\nDrop a comment below or DM to get early access! 👇\n\n#startups #founders #ai #productivity #buildinpublic",
                "twitter_thread": [
                  "1/ Most startup founders spend 60% of their time on repetitive tasks instead of building.\n\nHere is how we automated our entire executive workflow with autonomous AI agents: 🧵👇",
                  "2/ The problem: Juggling hiring pipelines, calculating runway spreadsheets, drafting NDAs, and writing marketing copy destroys founder focus.",
                  "3/ The solution: A dedicated 5-agent team (CEO, Hiring, Marketing, Finance, Legal) that routes and executes tasks in real time.",
                  "4/ The result: 10x faster execution without hiring an army of consultants.",
                  "5/ We're opening up early access today. Try it here: [Link] 🚀"
                ],
                "telegram_discord_broadcast": "🔥 **Product Update:** We just dropped our new autonomous 5-Agent architecture. You can now delegate entire multi-step company workflows in 1 click. Check the dashboard now!"
            },
            "email_campaign": {
                "subject_lines": [
                    "🚀 Meet your new autonomous executive team",
                    "How to scale your startup without the operational chaos",
                    "FounderOS 5-Agent Architecture is live"
                ],
                "preview_text": "Automate hiring, marketing, finance, and legal in one unified dashboard.",
                "body_markdown": "Hey Founder,\n\nBuilding a high-growth company moves fast, but operational bottlenecks can stall momentum.\n\nWe built FounderOS to automate your most critical company functions:\n- **CEO Orchestrator:** Dynamic multi-agent execution\n- **Hiring & Talent:** End-to-end recruitment pipelines\n- **Marketing & Growth:** Multi-channel GTM copy\n- **Financial Intelligence:** Runway & burn rate calculations\n- **Legal Compliance:** Instant offer letters and agreements\n\nReady to see it in action?\n\n[Launch Your First Autonomous Task Now]\n\nBest,\nThe FounderOS Team"
            },
            "campaign_kpis": [
                {"channel": "LinkedIn", "kpi": "Post Impressions", "target": "15,000+"},
                {"channel": "Twitter/X", "kpi": "Thread Retweets & Bookmarks", "target": "300+"},
                {"channel": "Inbound Funnel", "kpi": "Active Workflow Executions", "target": "50+"}
            ]
        }

        res = self.gemini.generate_json(
            prompt=llm_prompt,
            system_instruction="You are the Marketing AI Agent. Output strictly valid JSON marketing campaigns.",
            fallback_data=fallback
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        data = res.get("data", fallback)
        camp = data.get("campaign_name", "Marketing Campaign")

        return {
            "agent_name": self.name,
            "intent": "MARKETING_CAMPAIGN_GENERATION",
            "input_prompt": prompt,
            "status": "COMPLETED",
            "result_summary": f"Generated complete multi-channel marketing campaign and social assets for {camp}.",
            "artifact_payload": data,
            "tokens_used": res.get("tokens_used", 0),
            "execution_time_ms": elapsed_ms
        }
