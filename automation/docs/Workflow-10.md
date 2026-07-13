# Workflow 10 — WF-Citizen-Activity

## Purpose
Monitors citizen activities on the application to maintain activity history audits and active statistics. Updates counters like total complaints filed, surveys completed, and updates the profile's last active timestamp when actions are triggered.

## Trigger
- **Type**: Webhook Trigger (Incoming POST)
- **Path**: `citizen-activity`
- **Response**: Responds via a "Respond to Webhook" node when statistics and active timestamps are updated.

## Input Payload Example
```json
{
  "citizenId": "65e64b8d009fc22a",
  "activityType": "COMPLAINT_CREATED"
}
```

## Output Response
```json
{
  "success": true,
  "message": "Citizen activity stats updated successfully.",
  "citizenId": "65e64b8d009fc22a",
  "lastActivityAt": "2026-07-13T03:45:00.000Z"
}
```

## Collections Used
- `citizens` (Read/Write)
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
