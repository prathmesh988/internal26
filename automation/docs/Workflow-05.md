# Workflow 5 — WF-Complaint-Escalation

## Purpose
Monitors complaints for SLA compliance. It runs periodically to scan for active complaints (`OPEN` or `ASSIGNED`) that have been sitting unresolved for over 24 hours. For each stale complaint, it increments the escalation level, updates the timeline, identifies the ward supervisor, and creates alerts.

## Trigger
- **Type**: Schedule Trigger (Hourly)
- **Settings**: Runs every 1 hour on the hour.

## Input Payload Example
None (triggers automatically via schedule).

## Output Response
None (writes logs and alerts).

## Collections Used
- `complaints` (Read/Write)
- `workers` (Read)
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
