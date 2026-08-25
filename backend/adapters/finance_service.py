import re
from typing import Dict, Any

class MockFinanceService:
    @staticmethod
    def analyze_hiring_budget(role: str, budget_hint: str = None) -> Dict[str, Any]:
        # Small startup budget modeling: strictly capped at at most ₹10,000 / month stipend
        min_stipend = 8000
        max_stipend = 10000

        if budget_hint:
            match = re.search(r'(\d+)\s*k', budget_hint, re.IGNORECASE)
            if match:
                val = int(match.group(1)) * 1000
                if val <= 10000:
                    max_stipend = val
                    min_stipend = max(5000, val - 2000)

        monthly_stipend_str = f"₹{min_stipend:,} – ₹{max_stipend:,} / month"
        annual_ceiling_str = f"₹{max_stipend * 12:,} / year (₹{max_stipend * 3:,} for 3-month term)"
        monthly_burn_str = f"₹{max_stipend:,} / month"

        return {
            'recommended_role': f"{role} (Intern)",
            'salary_range': monthly_stipend_str,
            'hiring_budget': annual_ceiling_str,
            'monthly_burn_increase': monthly_burn_str,
            'financial_assessment': 'Fully Affordable & Approved (Startup Intern Tier)',
            'runway_impact': f'Runway impact is negligible (< 0.15 months). Monthly burn increases by only {monthly_burn_str}, preserving > 24 months cash reserves.',
            'reason': f'Optimal startup leverage: hiring an ambitious {role} intern at {monthly_stipend_str} delivers rapid product velocity within our strict <= ₹10k/month budget cap.',
            'constraints_for_downstream': {
                'max_salary': f"₹{max_stipend:,} / month",
                'min_salary': f"₹{min_stipend:,} / month",
                'term_duration': '3 - 6 Months Internship with PPO consideration',
                'stipend_cap': '₹10,000 / month maximum'
            }
        }

    @staticmethod
    def analyze_office_lease(rent_hint: str = None) -> Dict[str, Any]:
        rent_amount = rent_hint if rent_hint else '₹1,25,000 / month (₹15L / year)'
        return {
            'facility_budget': rent_amount,
            'security_deposit_required': '₹3,75,000 (3 months advance)',
            'monthly_operating_expense': '₹1,50,000 (including high-speed fiber + utilities)',
            'financial_assessment': 'Feasible & Approved',
            'runway_impact': 'Operating cash reserves exceed 14 months buffer.',
            'reason': 'Consolidating distributed team will increase collaboration velocity and client meeting capacity.'
        }

    @staticmethod
    def analyze_marketing_budget(budget_hint: str = None) -> Dict[str, Any]:
        budget = budget_hint if budget_hint else ',000 (₹12.5 Lakhs)'
        return {
            'total_campaign_budget': budget,
            'target_cac': ' / customer',
            'target_roas': '3.8x within 90 days',
            'daily_ad_spend_cap': ' / day',
            'financial_assessment': 'High ROI Potential',
            'reason': 'Target customer LTV is , making a  CAC highly accretive to gross margin.'
        }
