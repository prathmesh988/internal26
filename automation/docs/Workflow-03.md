# Workflow 3 — WF-Notification-Dispatcher

## Purpose
A single-responsibility routing center for all notification activities. It fetches the created notification document, grabs citizen contact coordinates, inspects the requested notification channel, dispatches to target handlers, updates delivery records, and logs delivery success.

## Trigger
- **Type**: Webhook Trigger (Incoming POST)
- **Path**: `notification-dispatcher`
- **Response**: Responds via a "Respond to Webhook" node when notification is dispatched.

## Input Payload Example
```json
{
  "notificationId": "65e64a220268c11bf20d"
}
```

## Output Response
```json
{
  "success": true,
  "notificationId": "65e64a220268c11bf20d",
  "channel": "EMAIL"
}
```

## Collections Used
- `notifications` (Read/Write)
- `citizens` (Read)
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
- **SMS/Push Credentials**: Configuration settings for external dispatch APIs.

## Environment Variables
- `DATABASE_ID` (Default: `6a540f2e001dfabaccb5`)
- `N8N_URL` (Base URL for internal webhook trigger calls, e.g. `http://localhost:5678`)
