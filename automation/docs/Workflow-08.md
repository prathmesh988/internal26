# Workflow 8 — WF-Pickup-Reminder

## Purpose
Citizen convenience alert workflow. It reads today's scheduled routes that are marked as planned, loops through each route to gather ward codes, pulls all citizens registered in those wards, and automatically creates and dispatches morning email/SMS reminders.

## Trigger
- **Type**: Schedule Trigger (Daily)
- **Settings**: Runs every day at 07:00.

## Input Payload Example
None (triggers automatically via schedule).

## Output Response
None (writes logs and sends alerts).

## Collections Used
- `routes` (Read)
- `citizens` (Read)
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
