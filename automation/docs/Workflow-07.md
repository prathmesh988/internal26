# Workflow 7 — WF-Daily-Analytics

## Purpose
Compiles performance analytics. It gathers total counts for new complaints, resolved complaints, active escalations, and issued rewards over the past 24 hours. It generates an HTML analytics summary table and emails it to the municipal administrator.

## Trigger
- **Type**: Schedule Trigger (Daily)
- **Settings**: Runs every day at 23:59.

## Input Payload Example
None (triggers automatically via schedule).

## Output Response
None (writes logs and sends emails).

## Collections Used
- `complaints` (Read)
- `rewards` (Read)
- `workflow_logs` (Write)

## Error Handling
- Includes a dedicated **Error Trigger** node connected to a failure logger.
- Failing nodes trigger database log writes and admin alerts.

## Retry Strategy
- Critical HTTP Requests to Appwrite are configured with standard retries:
  - `maxTries`: 3
  - `waitBetweenTries`: 2000 ms

## Required Credentials
- **WasteFlow SMTP**: Credentials for dispatching SMTP notifications to administrators on failures and for sending the daily analytics report itself.
- **X-Appwrite-Project**: Header configuration
- **X-Appwrite-Key**: Header configuration

## Environment Variables
- `DATABASE_ID` (Default: `6a540f2e001dfabaccb5`)
- `N8N_URL` (Base URL for internal webhook trigger calls, e.g. `http://localhost:5678`)
