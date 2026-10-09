import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api"

endpoints = [
    "/dashboard",
    "/vehicles",
    "/bookings",
    "/customers",
    "/customers/leads",
    "/analytics/metrics",
    "/analytics/compare",
    "/analytics/utilization",
    "/analytics/anomalies",
    "/maintenance/records",
    "/maintenance/tasks",
    "/activity"
]

print("--- Testing FleetIQ FastAPI REST API Endpoints ---")
for ep in endpoints:
    url = f"{BASE_URL}{ep}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            status = response.status
            count = len(data) if isinstance(data, list) else "dict"
            print(f"✓ GET {ep} -> HTTP {status} (Result: {count})")
    except Exception as e:
        print(f"✗ GET {ep} -> Error: {e}")

# Test Agent Hub Orchestration Endpoint
print("\n--- Testing Agent Hub Orchestration Request ---")
try:
    post_data = json.dumps({
        "conversation_id": "test-verification-run",
        "user_request": "Our rental revenue has dropped this month. Find the reason and help us recover bookings."
    }).encode('utf-8')

    req = urllib.request.Request(
        f"{BASE_URL}/agent-hub/process",
        data=post_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print(f"✓ POST /agent-hub/process -> HTTP {response.status}")
        print(f"  Selected Agents: {result['route_decision']['selected_agents']}")
        print(f"  Summary: {result['report']['summary'][:120]}...")
        print(f"  Findings Count: {len(result['report']['key_findings'])}")
except Exception as e:
    print(f"✗ POST /agent-hub/process -> Error: {e}")
