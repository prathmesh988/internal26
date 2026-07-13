# Workflow 9 — WF-Vehicle-Monitoring

## Purpose
Fleet telemetry health checks. It periodically checks the status of all active vehicles (`IN_USE`). It flags any vehicle whose location details have not changed or updated for more than 15 minutes, warning dispatch operators of potential signal failures or breakdowns.

## Trigger
- **Type**: Schedule Trigger (Every 5 minutes)
- **Settings**: Runs every 5 minutes.

## Input Payload Example
None (triggers automatically via schedule).

## Output Response
None (writes logs and sends alerts).

## Collections Used
- `vehicles` (Read)
- `notifications` (Write)
- `workflow_logs` (Write)

## Error Handling
- Includes a dedicated **Error Trigger** node connected to a failure logger.
- Failing nodes trigger database log writes and admin alerts.

## Retry Strategy
- Critical HTTP Requests to Appwrite are configured with standard retries:
  - `maxTries`: 3
  - `waitBetweenTries`: 2000 ms

## Required Credentials
- **WasteFlow SMTP**: Credentials for dispatching SMTP notifications to administrators on failures.
- **X-Appwrite-Project**: Header configuration
- **X-Appwrite-Key**: Header configuration

## Environment Variables
- `DATABASE_ID` (Default: `6a540f2e001dfabaccb5`)
- `N8N_URL` (Base URL for internal webhook trigger calls, e.g. `http://localhost:5678`)
