# Workflow 6 — WF-Reward-System

## Purpose
A single-responsibility points engine. It accepts reward signals, increments the corresponding citizen's reward points, creates a history log entry in the `rewards` collection, creates a congratulations notification for the user, and triggers dispatch.

## Trigger
- **Type**: Webhook Trigger (Incoming POST)
- **Path**: `reward-system`
- **Response**: Responds via a "Respond to Webhook" node when points update operations are finalized.

## Input Payload Example
```json
{
  "citizenId": "65e64b8d009fc22a",
  "points": 50,
  "reason": "SEGREGATION"
}
```

## Output Response
```json
{
  "success": true,
  "message": "Reward points added successfully.",
  "citizenId": "65e64b8d009fc22a",
  "pointsAdded": 50,
  "newTotal": 250
}
```

## Collections Used
- `citizens` (Read/Write)
- `rewards` (Write)
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
