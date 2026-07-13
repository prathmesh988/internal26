# WasteFlow - n8n Workflow Specifications

> Project: WasteFlow
> Platform: n8n
> Database: Appwrite
> Architecture: Event-Driven Automation
> Version: 1.0

---

# General Rules

All workflows must follow these principles.

## Source of Truth

Appwrite is the source of truth.

n8n MUST NEVER create complaint records directly.

All complaint documents are created by the backend.

n8n only performs automation after receiving a webhook.

---

## Appwrite

All CRUD operations must use the Appwrite REST API through HTTP Request nodes.

Do NOT use PostgreSQL nodes.

---

## Error Handling

Every workflow must include

- Error path
- Retry logic
- HTTP failure handling
- Activity log
- Workflow log

---

## Logging

Every workflow execution must create an entry in

workflow_logs

Example

```
Workflow Started

↓

Worker Assigned

↓

Notification Created

↓

Citizen Email Sent

↓

Workflow Completed
```

If an error occurs

```
Workflow Failed

↓

Store Error

↓

Notify Admin
```

---

## Naming Convention

Example

```
WF-Complaint-Automation

WF-Complaint-Escalation

WF-Worker-Assignment

WF-Reward-System
```

Node names should clearly describe their purpose.

---

# Workflow 1

## Complaint Automation

Trigger

Webhook

Input

Complaint Created

Steps

1.

Validate payload

↓

2.

Fetch complaint document from Appwrite

↓

3.

Determine priority

↓

4.

Determine department

↓

5.

Find available worker

↓

6.

Assign worker

↓

7.

Update complaint

↓

8.

Create notification

↓

9.

Email citizen

↓

10.

Email worker

↓

11.

Create workflow log

↓

12.

Return Success

---

Collections Used

- complaints
- workers
- notifications
- workflow_logs

---

Output

Complaint assigned successfully

---

# Workflow 2

## Complaint Escalation

Trigger

Cron

Runs

Every 1 hour

Steps

Find complaints

Status

OPEN

or

ASSIGNED

Older than

24 Hours

↓

Increase escalation count

↓

Update complaint

↓

Create notification

↓

Notify Supervisor

↓

Workflow Log

---

Collections

complaints

notifications

workflow_logs

workers

---

# Workflow 3

## Complaint Resolution

Trigger

Webhook

Worker marks complaint resolved

↓

Update complaint

↓

Calculate response time

↓

Calculate resolution duration

↓

Update complaint

↓

Create notification

↓

Reward citizen

↓

Workflow log

---

Collections

complaints

notifications

rewards

workflow_logs

citizens

---

# Workflow 4

## Reward Automation

Trigger

Webhook

Citizen earns reward

↓

Update reward points

↓

Insert reward transaction

↓

Create notification

↓

Workflow log

---

Collections

citizens

rewards

notifications

workflow_logs

---

# Workflow 5

## Worker Assignment

Trigger

Internal Webhook

↓

Read ward

↓

Find available worker

↓

Choose lowest workload

↓

Assign complaint

↓

Update worker

↓

Workflow log

---

Collections

workers

complaints

workflow_logs

---

# Workflow 6

## Daily Analytics

Trigger

Cron

Every day

23:59

↓

Count complaints

↓

Count resolved

↓

Count escalated

↓

Count rewards

↓

Generate statistics

↓

Email Admin

↓

Workflow log

---

Collections

complaints

citizens

workers

rewards

workflow_logs

---

# Workflow 7

## Pickup Reminder

Trigger

Cron

Every day

7 AM

↓

Read today's routes

↓

Create notifications

↓

Send Emails

↓

Workflow log

---

Collections

routes

notifications

workflow_logs

---

# Workflow 8

## Vehicle Monitoring

Trigger

Cron

Every 5 Minutes

↓

Read vehicles

↓

Check stale GPS

↓

Notify admin

↓

Workflow log

---

Collections

vehicles

workflow_logs

notifications

---

# Workflow 9

## Notification Dispatcher

Trigger

Webhook

↓

Read notification

↓

Determine channel

↓

Email

↓

Push

↓

SMS

↓

Update delivery status

↓

Workflow log

---

Collections

notifications

workflow_logs

---

# Workflow 10

## Citizen Activity

Trigger

Webhook

Citizen Login

Complaint Created

Survey Submitted

↓

Update citizen stats

↓

Update last activity

↓

Workflow log

---

Collections

citizens

workflow_logs

---

# Common Node Standards

Every workflow must contain

Webhook or Cron

↓

Validate Input

↓

HTTP Request (Appwrite)

↓

IF

↓

Set

↓

Switch

↓

Email

↓

Error Handling

↓

Workflow Log

↓

Respond to Webhook

---

# HTTP Standards

Use

HTTP Request

Authorization

Bearer API_KEY

Headers

```

X-Appwrite-Project

X-Appwrite-Key

Content-Type

application/json

```

---

# Deliverables

The AI agent should generate

- One independent JSON file per workflow
- Import-ready n8n workflows
- Proper node naming
- Error handling
- Retry logic
- Comments inside Code nodes
- Readable layout
- Consistent naming convention

---

# Output Structure

```
automation/
│
├── WF-Complaint-Automation.json
├── WF-Complaint-Escalation.json
├── WF-Complaint-Resolution.json
├── WF-Worker-Assignment.json
├── WF-Reward-System.json
├── WF-Notification-Dispatcher.json
├── WF-Daily-Analytics.json
├── WF-Pickup-Reminder.json
├── WF-Vehicle-Monitoring.json
└── WF-Citizen-Activity.json
```

---

# Design Philosophy

Each workflow must have one responsibility only.

Workflows must communicate through Appwrite.

Avoid creating one large workflow containing multiple unrelated automations.

Each workflow should be independently testable, reusable, and importable into n8n.

All business data must remain in Appwrite.

n8n should only orchestrate automation and never become the primary data store.