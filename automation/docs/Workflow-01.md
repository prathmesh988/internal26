# Workflow 1 — WF-Complaint-Automation

## Purpose
Orchestrates the entry point when a new waste management complaint is filed by a citizen. It validates the complaint, triggers assignment, assigns the available worker with the lowest workload, schedules customer alerts, and registers workflow audits.

## Trigger
- **Type**: Webhook Trigger (Incoming POST)
- **Path**: `complaint-automation`
- **Response**: Responds via a "Respond to Webhook" node when the assignment is finalized or skipped.

## Input Payload Example
```json
{
  "complaintId": "65e6488d011ff23acdb0"
}
```

## Output Response
```json
{
  "success": true,
  "message": "Complaint assigned successfully.",
  "complaintId": "65e6488d011ff23acdb0",
  "workerId": "65e648f500a12bb92cc1"
}
```

## Collections Used
- `complaints` (Read/Write)
- `workers` (Read/Write)
- `notifications` (Write)
- `workflow_logs` (Write)

## Error Handling
- Includes a dedicated **Error Trigger** node connected to a failure logger.
- If any node in the happy path fails, execution branches to `Log Failure` in the database and fires an alert email to the admin.

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
