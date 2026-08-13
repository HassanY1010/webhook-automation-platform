# User Manual & Operating Guide

## Getting Started

1. **Register Organization Workspace**:
   Navigate to `/register` and create your account and organization workspace.

2. **Create your First Automation Bot**:
   - Go to **Automation Bots** -> **Create New Bot**.
   - Step 1: Provide a name and description.
   - Step 2: Select execution mode (`LIVE`, `DRY_RUN`, `DEMO`).
   - Step 3: Configure conditions using the Visual Rule Builder (e.g. `price <= 500 AND status == "available"`).
   - Step 4: Configure HTTP Action destination URL and template body (`{"itemId": "{{event.itemId}}"}`).
   - Step 5: Run a Test Simulation.
   - Step 6: Deploy & Publish Version 1.

3. **Ingest Webhooks**:
   Copy your bot's unique Webhook Target Endpoint URL:
   `http://localhost:4000/webhooks/bot_xxx`

4. **Inspect Execution Logs**:
   Visit **Execution Logs** to inspect detailed step-by-step traces, duration metrics, and action response payloads.
