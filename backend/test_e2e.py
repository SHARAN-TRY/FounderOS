import urllib.request
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE = "http://127.0.0.1:8000"

def req(path, method="GET", data=None, token=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

# 1. Social Auth
status, auth_data = req("/api/auth/social", "POST", {
    "email": "founder_full_e2e@founderos.io",
    "full_name": "Founder CEO",
    "picture": ""
})
token = auth_data["access_token"]
print("1. Auth Token acquired successfully.")

# 2. Test Hiring Task (Internship Model: at most 10k/month)
status, task = req("/api/tasks", "POST", {
    "title": "I want to hire a frontend intern with at most 10k per month salary.",
    "date": "Aug 25, 2026"
}, token=token)
print(f"2. Task created: ID={task['id']}, Status={task['status']}")
assert task["status"] == "AWAITING_PLAN_APPROVAL"

plan = json.loads(task["plan_data"])
print(f"   CEO Plan Goal: {plan['goal']}")
print(f"   Execution Steps: {[s['agent'] for s in plan['execution_steps']]}")
assert "Intern" in plan["goal"] or "intern" in plan["goal"]
assert "10,000" in plan["budget_estimate"] or "10k" in plan["budget_estimate"]

# Level A Approval
status, task = req(f"/api/tasks/{task['id']}/plan/approve", "POST", {"decision": "APPROVED"}, token=token)
print(f"3. Plan Approved: Task Status={task['status']}")
assert task["status"] == "APPROVED"

del_map = {d["agent"]: d for d in task["delegations"]}
assert del_map["Finance"]["status"] == "READY"
assert del_map["Marketing"]["status"] == "BLOCKED"

# Execute Finance
fin_id = del_map["Finance"]["id"]
status, fin_del = req(f"/api/agent-tasks/{fin_id}/start", "POST", None, token=token)
print(f"4. Finance Task Executed: Status={fin_del['status']}")
fin_result = json.loads(fin_del["result_output"])
print(f"   Finance Recommended Stipend: {fin_result['salary_range']} (Burn increase: {fin_result['monthly_burn_increase']})")
assert "10,000" in fin_result["salary_range"] or "10,000" in fin_result["monthly_burn_increase"]
# Level B Approve Finance
status, fin_del = req(f"/api/agent-tasks/{fin_id}/approve", "POST", {"feedback": "Approved"}, token=token)
print("5. Finance Result Approved (Level B).")

# Check Marketing unblocked
status, dash = req("/api/dashboard", "GET", None, token=token)
t = next(x for x in dash["tasks"] if x["id"] == task["id"])
del_map = {d["agent"]: d for d in t["delegations"]}
print(f"6. Marketing status after Finance approval: {del_map['Marketing']['status']}")
assert del_map["Marketing"]["status"] == "READY"

# Execute Marketing
mkt_id = del_map["Marketing"]["id"]
status, mkt_del = req(f"/api/agent-tasks/{mkt_id}/start", "POST", None, token=token)
# Level C Consequential Action on Marketing
status, act_res = req(f"/api/agent-tasks/{mkt_id}/consequential-action", "POST", {
    "action_id": "post_linkedin",
    "action_name": "Post to LinkedIn",
    "payload": {"platform": "LinkedIn"}
}, token=token)
print(f"7. Marketing Level C Consequential Action Dispatched: Status={status}")
# Level B Approve Marketing
req(f"/api/agent-tasks/{mkt_id}/approve", "POST", {}, token=token)

# Check Hiring unblocked
status, dash = req("/api/dashboard", "GET", None, token=token)
t = next(x for x in dash["tasks"] if x["id"] == task["id"])
del_map = {d["agent"]: d for d in t["delegations"]}
assert del_map["Hiring"]["status"] == "READY"

# Execute Hiring
hir_id = del_map["Hiring"]["id"]
status, hir_del = req(f"/api/agent-tasks/{hir_id}/start", "POST", None, token=token)
hir_result = json.loads(hir_del["result_output"])
cands = [c["name"] + " (" + str(c["match_score"]) + "%)" for c in hir_result["candidates"]]
print(f"8. Hiring Candidates Ranked: {cands}")
req(f"/api/agent-tasks/{hir_id}/approve", "POST", {}, token=token)

# Check Legal unblocked
status, dash = req("/api/dashboard", "GET", None, token=token)
t = next(x for x in dash["tasks"] if x["id"] == task["id"])
del_map = {d["agent"]: d for d in t["delegations"]}
assert del_map["Legal"]["status"] == "READY"

# Execute Legal
leg_id = del_map["Legal"]["id"]
status, leg_del = req(f"/api/agent-tasks/{leg_id}/start", "POST", None, token=token)
# Level C Consequential Action on Legal (Send Offer via DocuSign)
status, act_res = req(f"/api/agent-tasks/{leg_id}/consequential-action", "POST", {
    "action_id": "send_offer_letter",
    "action_name": "Send Offer via DocuSign",
    "payload": {"candidate_name": "Rahul Sharma"}
}, token=token)
print(f"9. Legal Level C Offer Dispatched: Status={status}")
# Level B Approve Legal
req(f"/api/agent-tasks/{leg_id}/approve", "POST", {}, token=token)

# Final task status verification
status, dash = req("/api/dashboard", "GET", None, token=token)
t = next(x for x in dash["tasks"] if x["id"] == task["id"])
print(f"10. Workflow Completed! Task Progress={t['progress']}%, Status={t['status']}")
assert t["progress"] == 100
assert t["status"] == "COMPLETED"

# 11. Test Dynamic Orchestration: Office Lease
status, office_task = req("/api/tasks", "POST", {
    "title": "Analyze whether we can afford a new office with ₹15L annual rent.",
    "date": "Aug 24, 2026"
}, token=token)
office_plan = json.loads(office_task["plan_data"])
print(f"11. Dynamic Test (Office Lease) Agents: {[s['agent'] for s in office_plan['execution_steps']]} (Skipped: {office_plan['skipped_agents']})")
assert "Finance" in [s["agent"] for s in office_plan["execution_steps"]]
assert "Marketing" in office_plan["skipped_agents"]

# 12. Test Dynamic Orchestration: Marketing Launch
status, launch_task = req("/api/tasks", "POST", {
    "title": "Create a launch marketing strategy for our product.",
    "date": "Aug 24, 2026"
}, token=token)
launch_plan = json.loads(launch_task["plan_data"])
print(f"12. Dynamic Test (Marketing Launch) Agents: {[s['agent'] for s in launch_plan['execution_steps']]} (Skipped: {launch_plan['skipped_agents']})")
assert "Marketing" in [s["agent"] for s in launch_plan["execution_steps"]]
assert "Hiring" in launch_plan["skipped_agents"]

# 13. Audit logs
status, logs = req("/api/audit-logs", "GET", None, token=token)
print(f"13. Audit Logs Count: {len(logs)} entries logged.")

print("\n>>> ALL E2E ORCHESTRATION & 3-LEVEL APPROVAL TESTS PASSED WITH 100% SUCCESS! <<<")
