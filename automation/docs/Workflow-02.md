# Workflow 2 — WF-Worker-Assignment

## Purpose
Fulfills worker assignment requests. It searches for all municipal staff in the system who are active and currently marked available within the specified ward. It selects the worker who is carrying the lowest current workload (`totalComplaints`) and returns their details.

## Trigger
- **Type**: Webhook Trigger (Incoming POST)
- **Path**: `worker-assignment`
- **Response**: Responds via a "Respond to Webhook" node with the assigned worker profile or null if none were found.

## Input Payload Example
```json
{
  "complaintId": "65e6488d011ff23acdb0",
  "wardCode": "W03"
}
```

## Output Response
```json
{
  "workerId": "65e648f500a12bb92cc1",
  "workerName": "Anjali Mehta",
  "workerEmail": "anjali.mehta@wasteflow.in"
}
```

## Collections Used
- `workers` (Read)
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
