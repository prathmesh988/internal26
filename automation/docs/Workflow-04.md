# Workflow 4 — WF-Complaint-Resolution

## Purpose
Completes a complaint's life cycle. It marks the target complaint document status as resolved, captures resolution duration and response times, makes the worker available again (`isAvailable = true`), triggers citizen rewards, creates and dispatches citizen notifications, and adds timeline audits.

## Trigger
- **Type**: Webhook Trigger (Incoming POST)
- **Path**: `complaint-resolution`
- **Response**: Responds via a "Respond to Webhook" node when the resolution operations are finalized.

## Input Payload Example
```json
{
  "complaintId": "65e6488d011ff23acdb0",
  "workerId": "WRK-001",
  "resolutionNotes": "Cleaned up spillage and swept surrounding area."
}
```

## Output Response
```json
{
  "success": true,
  "message": "Complaint marked as resolved successfully.",
  "complaintId": "65e6488d011ff23acdb0",
  "resolutionDuration": 255
}
```

## Collections Used
- `complaints` (Read/Write)
- `workers` (Read/Write)
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
