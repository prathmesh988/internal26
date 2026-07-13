# WasteFlow — Appwrite Database Schema

> **App:** WasteFlow — Smart Waste Management Automation System
> **Platform:** Appwrite (Database + Storage + Auth)
> **Version:** 1.1 — n8n Integration & Scalability Improvements
> **Last Updated:** July 2026

---

## Overview

WasteFlow uses Appwrite as its backend. The database contains **10 collections** spanning the core domain: complaints, citizens, workers, vehicles, routes, wards, violations, notifications, rewards, and workflow_logs. Appwrite Auth handles user management. Appwrite Storage handles media (complaint photos, violation evidence). **n8n** powers all workflow automation and only communicates with Appwrite — it never becomes the source of truth.

---

## Database: `wasteflow_db`

---

## Collections

### 1. `complaints`

Stores all citizen-reported waste management complaints and their full lifecycle, including AI classification, assignment audit trail, resolution metadata, and a denormalized timeline.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Appwrite `$id` (auto-generated) |
| `citizenId` | `string` | ✅ | — | Relation → `citizens.$id` |
| `filedByCitizenId` | `string` | ✅ | — | Alias of citizenId used for auth guard matching |
| `ward` | `string` | ✅ | — | Human-readable ward name (e.g. `Ward 03`) |
| `wardCode` | `string` | ✅ | — | Short code (e.g. `W03`). Indexed. |
| `category` | `enum` | ✅ | `MISSED_PICKUP` | See **ComplaintCategory** enum |
| `title` | `string` | ✅ | — | Max 100 chars. Brief summary. |
| `description` | `string` | ✅ | — | Max 500 chars. Full detail. |
| `location` | `string (JSON)` | ✅ | — | `{ lat: float, lng: float }` stored as JSON string |
| `status` | `enum` | ✅ | `OPEN` | See **ComplaintStatus** enum |
| `priority` | `enum` | ✅ | `MEDIUM` | See **ComplaintPriority** enum |
| `imageUrl` | `string` | ❌ | `null` | Appwrite Storage file URL |
| `createdAt` | `datetime` | ✅ | now | ISO 8601 |
| `updatedAt` | `datetime` | ✅ | now | Auto-updated on every write |
| **Assignment** | | | | |
| `assignedToWorkerId` | `string` | ❌ | `null` | Relation → `workers.$id` |
| `assignedToWorkerName` | `string` | ❌ | `null` | Denormalized for display |
| `assignedToWorkerEmail` | `string` | ❌ | `null` | Denormalized — avoids extra query from n8n for emails |
| `assignedAt` | `datetime` | ❌ | `null` | When the assignment was made |
| `assignedBy` | `string` | ❌ | `null` | `System` or admin user ID |
| `assignmentMethod` | `enum` | ❌ | `null` | `AUTO \| MANUAL` |
| **Resolution** | | | | |
| `resolutionNotes` | `string` | ❌ | `null` | Officer notes on resolution |
| `resolvedAt` | `datetime` | ❌ | `null` | Set when status → `RESOLVED` |
| `resolvedByWorkerId` | `string` | ❌ | `null` | Worker who closed the complaint |
| `resolvedByWorkerName` | `string` | ❌ | `null` | Denormalized worker name |
| `resolutionDuration` | `integer` | ❌ | `null` | Total resolution time in minutes |
| **Analytics** | | | | |
| `responseTime` | `integer` | ❌ | `null` | Minutes from creation to first action |
| `firstResponseAt` | `datetime` | ❌ | `null` | Timestamp of first status change |
| `estimatedResolutionTime` | `string` | ❌ | `null` | ETA string e.g. `"within 24 hours"` |
| **Escalation** | | | | |
| `escalationCount` | `integer` | ✅ | `0` | Times escalated |
| `escalatedAt` | `datetime` | ❌ | `null` | Timestamp of last escalation |
| `escalationReason` | `string` | ❌ | `null` | Reason for escalation |
| `escalatedBy` | `string` | ❌ | `null` | User ID or `System` |
| `escalationLevel` | `enum` | ❌ | `null` | `LEVEL_1 \| LEVEL_2 \| LEVEL_3` |
| **Timeline** | | | | |
| `timeline` | `string (JSON)` | ✅ | `[]` | Array of `{ action, time }` — see below |
| **AI Fields** | | | | |
| `aiCategory` | `string` | ❌ | `null` | AI-predicted category (future Gemini/OpenAI) |
| `aiConfidence` | `float` | ❌ | `null` | Confidence score 0.0–1.0 |
| `aiSummary` | `string` | ❌ | `null` | AI-generated summary of the complaint |

#### Timeline JSON Schema

```json
[
  { "action": "Complaint Created", "time": "2026-07-13T05:30:00Z" },
  { "action": "Assigned to Worker", "time": "2026-07-13T05:31:20Z" },
  { "action": "Worker Started", "time": "2026-07-13T06:00:00Z" },
  { "action": "Resolved", "time": "2026-07-13T07:45:00Z" }
]
```

Append a new entry on every status change. Allows the frontend to render a full timeline without additional queries.

**Indexes:**
- `wardCode`
- `status`
- `priority`
- `createdAt`
- `citizenId`

**Enums:**

**ComplaintStatus:** `OPEN | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED | ESCALATED | REJECTED`

> `REJECTED` is used for duplicate, invalid, spam, or out-of-jurisdiction complaints. Clearer than `CLOSED`.

**ComplaintPriority:** `LOW | MEDIUM | HIGH | CRITICAL`

**ComplaintCategory:** `MISSED_PICKUP | OVERFLOW | SPILL | ILLEGAL_DUMPING | SEGREGATION | VEHICLE_ISSUE | OTHER`

**AssignmentMethod:** `AUTO | MANUAL`

**EscalationLevel:** `LEVEL_1 | LEVEL_2 | LEVEL_3`

**Permissions:**
- Citizen: `create`, `read` (own only)
- Admin: `read`, `update`, `delete` (all)
- Worker: `read`, `update` (assigned only)
- n8n (API Key): `read`, `update`

---

### 2. `citizens`

Registered citizen accounts linked to Appwrite Auth users.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Appwrite `$id` — matches Auth user ID |
| `email` | `string` | ✅ | — | Unique. Sourced from Auth. |
| `name` | `string` | ✅ | — | Full name |
| `phone` | `string` | ✅ | — | Mobile with country code |
| `ward` | `string` | ✅ | — | Human-readable ward name |
| `wardCode` | `string` | ✅ | — | Short code (e.g. `W01`). Indexed. |
| `address` | `string` | ✅ | — | Street address |
| `rewardPoints` | `integer` | ✅ | `0` | Accumulated gamification points |
| `completedSurveys` | `integer` | ✅ | `0` | Count of surveys submitted |
| `complaintsFiled` | `integer` | ✅ | `0` | Running count of filed complaints |
| `complianceScore` | `integer` | ✅ | `100` | Range 0–100. Decreases on violations. |
| `createdAt` | `datetime` | ✅ | now | Account creation time |
| `lastActivityAt` | `datetime` | ✅ | now | Last login or action timestamp |

**Indexes:**
- `wardCode`
- `email` — unique

**Permissions:**
- Citizen: `read`, `update` (own only)
- Admin: `read`, `update` (all)

---

### 3. `workers`

Municipal staff — collectors, drivers, supervisors, route planners, and admins.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | e.g. `WRK-001` |
| `name` | `string` | ✅ | — | Full name |
| `email` | `string` | ✅ | — | Municipal email |
| `phone` | `string` | ✅ | — | Contact number |
| `role` | `enum` | ✅ | `COLLECTOR` | See **WorkerRole** enum |
| `status` | `enum` | ✅ | `ACTIVE` | See **WorkerStatus** enum |
| `isAvailable` | `boolean` | ✅ | `true` | Fine-grained availability flag. A worker can be `ACTIVE` but `isAvailable=false` (on break, at capacity). n8n assignment automation uses this. |
| `assignedVehicle` | `string` | ❌ | `null` | Registration number of assigned vehicle |
| `ward` | `string` | ❌ | `null` | Human-readable ward name |
| `wardCode` | `string` | ❌ | `null` | Short ward code. Indexed. |
| `completionRate` | `float` | ✅ | `100` | 0–100 percentage |
| `averageRating` | `float` | ✅ | `5.0` | 1.0–5.0 citizen rating |
| `totalPickups` | `integer` | ✅ | `0` | Lifetime pickups completed |
| `totalComplaints` | `integer` | ✅ | `0` | Complaints raised against this worker |
| `hireDate` | `string` | ✅ | — | Date string `YYYY-MM-DD` |
| `lastActiveAt` | `datetime` | ✅ | now | Last active timestamp |

**Indexes:**
- `wardCode`
- `status`
- `isAvailable` — for fast assignment queries
- `role`

**Enums:**

**WorkerRole:** `COLLECTOR | SUPERVISOR | OPERATOR | ROUTE_PLANNER | ADMIN`

**WorkerStatus:** `ACTIVE | ON_LEAVE | INACTIVE | SUSPENDED | MAINTENANCE`

**Permissions:**
- Worker: `read` (own only)
- Admin: `read`, `update`, `delete` (all)
- n8n (API Key): `read`, `update` (for availability updates)

---

### 4. `vehicles`

The municipal fleet with live GPS tracking fields.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | e.g. `VEH-001` |
| `registrationNumber` | `string` | ✅ | — | e.g. `MH-12-GQ-4920`. Unique. |
| `type` | `enum` | ✅ | — | See **VehicleType** enum |
| `capacity` | `integer` | ✅ | — | Max load in kg |
| `currentLoad` | `integer` | ✅ | `0` | Current load in kg |
| `status` | `enum` | ✅ | `IDLE` | See **VehicleStatus** enum |
| `currentLocation` | `string (JSON)` | ✅ | — | `{ lat: float, lng: float }` as JSON string |
| `lastLocationUpdate` | `datetime` | ❌ | `null` | Timestamp of last GPS ping — for live map staleness detection |
| `speed` | `float` | ❌ | `0` | Current speed in km/h |
| `heading` | `float` | ❌ | `0` | Direction in degrees (0–360) — for map rotation icon |
| `assignedDriver` | `string` | ❌ | `null` | Worker `$id` of assigned driver |
| `assignedDriverName` | `string` | ❌ | `null` | Denormalized driver name |
| `route` | `string` | ❌ | `null` | Route `$id` currently assigned |
| `lastFueledAt` | `datetime` | ✅ | — | Timestamp of last fuel fill |
| `maintenanceDueAt` | `datetime` | ❌ | `null` | Scheduled maintenance date |
| `fuelLevel` | `integer` | ✅ | `100` | 0–100 percentage |
| `totalMileage` | `float` | ✅ | `0` | Total km driven |

**Indexes:**
- `status`
- `registrationNumber` — unique

**Enums:**

**VehicleType:** `COMPACTOR | TIPPER | OPEN_BED | SPECIAL_WASTE`

**VehicleStatus:** `IDLE | IN_USE | MAINTENANCE | FUEL | END_OF_DAY`

**Permissions:**
- Admin: `read`, `update` (all)
- Worker: `read` (own assigned vehicle)
- n8n (API Key): `update` (GPS pings)

---

### 5. `routes`

Planned and historical collection routes with checkpoint and deviation tracking, plus pre-computed analytics fields.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | e.g. `RT-Ward03-Primary` |
| `name` | `string` | ✅ | — | Human-readable route name |
| `ward` | `string` | ✅ | — | Ward name |
| `wardCode` | `string` | ✅ | — | Short ward code. Indexed. |
| `vehicleId` | `string` | ❌ | `null` | Relation → `vehicles.$id` |
| `workerId` | `string` | ❌ | `null` | Relation → `workers.$id` |
| `workerName` | `string` | ❌ | `null` | Denormalized |
| `status` | `enum` | ✅ | `PLANNED` | `PLANNED \| IN_PROGRESS \| COMPLETED \| FAILED` |
| `scheduledFor` | `datetime` | ✅ | — | Scheduled start |
| `startedAt` | `datetime` | ❌ | `null` | Actual start time |
| `completedAt` | `datetime` | ❌ | `null` | Actual completion time |
| `checkpoints` | `string (JSON)` | ✅ | `[]` | JSON array of RouteCheckpoint objects |
| `distance` | `float` | ✅ | — | Route length in km |
| `estimatedDuration` | `integer` | ✅ | — | Expected duration in minutes |
| `actualDuration` | `integer` | ❌ | `null` | Actual duration in minutes |
| `pickupsScheduled` | `integer` | ✅ | `0` | Total stops planned |
| `pickupsCompleted` | `integer` | ✅ | `0` | Stops completed |
| `efficiency` | `float` | ✅ | `100` | 0–100 completion % |
| `deviations` | `string (JSON)` | ✅ | `[]` | JSON array of RouteDeviation objects |
| **Analytics** | | | | |
| `missedCheckpoints` | `integer` | ✅ | `0` | Count of skipped stops |
| `delayMinutes` | `integer` | ✅ | `0` | Total delay accumulated in minutes |
| `completionPercentage` | `float` | ✅ | `0` | pickupsCompleted / pickupsScheduled × 100 |

> `completionPercentage` mirrors `efficiency` but is computed from pickup counts, not driver-reported completion. Both are useful for different analytics views.

#### RouteCheckpoint (nested in `checkpoints` JSON)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique checkpoint ID |
| `sequence` | `integer` | Order in the route |
| `location` | `object` | `{ lat, lng }` |
| `address` | `string` | Human-readable address |
| `expectedTime` | `string` | ISO time string |
| `actualTime` | `string?` | Recorded arrival |
| `status` | `enum` | `PENDING \| COMPLETED \| SKIPPED` |
| `pickupCount` | `integer?` | Households at this stop |
| `notes` | `string?` | Driver notes |

#### RouteDeviation (nested in `deviations` JSON)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique deviation ID |
| `type` | `enum` | `TIME_DELAY \| ROUTE_CHANGE \| MISSED_CHECKPOINT \| UNSCHEDULED_STOP` |
| `severity` | `enum` | `LOW \| MEDIUM \| HIGH` |
| `description` | `string` | What happened |
| `location` | `object` | `{ lat, lng }` |
| `detectedAt` | `string` | ISO datetime |
| `resolvedAt` | `string?` | Resolution datetime |

**Indexes:**
- `wardCode`
- `status`
- `scheduledFor`

**Permissions:**
- Admin: `read`, `update` (all)
- Worker: `read`, `update` (own assigned route)

---

### 6. `wards`

Static ward/geography master. Keyed by `code` as `$id`.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Use `code` as `$id` for direct lookup |
| `code` | `string` | ✅ | — | Unique short code: `W01`–`W06` |
| `name` | `string` | ✅ | — | Full ward name |
| `zone` | `string` | ✅ | — | Municipal zone grouping |
| `population` | `integer` | ✅ | — | Resident count |
| `area` | `float` | ✅ | — | Area in sq km |
| `complaintCount` | `integer` | ✅ | `0` | Total active complaints |
| `averageResponseTime` | `float` | ✅ | — | Avg response time in hours |
| `cleanlinessScore` | `integer` | ✅ | `100` | 0–100 score |
| `pickupsScheduledToday` | `integer` | ✅ | `0` | Today's scheduled pickups |
| `pickupsCompletedToday` | `integer` | ✅ | `0` | Today's completed pickups |
| `citizens` | `integer` | ✅ | `0` | Registered citizen count |
| `bounds` | `string (JSON)` | ✅ | — | `{ north, south, east, west }` as JSON string |

**Supported Ward Codes:** `W01 | W02 | W03 | W04 | W05 | W06`

**Indexes:** `code` — unique

**Permissions:**
- All authenticated users: `read`
- Admin only: `update`

---

### 7. `violations`

Compliance violations against citizens or workers, detected by AI or reported by officers.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Auto-generated |
| `citizenId` | `string` | ❌ | `null` | Linked citizen |
| `citizenName` | `string` | ❌ | `null` | Denormalized |
| `workerId` | `string` | ❌ | `null` | Linked worker |
| `workerName` | `string` | ❌ | `null` | Denormalized |
| `type` | `enum` | ✅ | — | See **ViolationType** enum |
| `severity` | `enum` | ✅ | `LOW` | `LOW \| MEDIUM \| HIGH` |
| `description` | `string` | ✅ | — | Violation detail |
| `location` | `string (JSON)` | ✅ | — | `{ lat, lng }` as JSON string |
| `ward` | `string` | ✅ | — | Ward name |
| `wardCode` | `string` | ✅ | — | Ward code. Indexed. |
| `fineAmount` | `float` | ✅ | `0` | Fine in INR |
| `status` | `enum` | ✅ | `OPEN` | `OPEN \| RESOLVED \| APPEALED` |
| `createdAt` | `datetime` | ✅ | now | |
| `resolvedAt` | `datetime` | ❌ | `null` | |
| `evidence` | `string (JSON)` | ❌ | `[]` | Array of Appwrite Storage file URLs |

**Indexes:** `wardCode`, `status`, `createdAt`, `citizenId`

**Enums:**

**ViolationType:** `IMPROPER_SEGREGATION | OVERFLOW_BIN | UNAUTHORIZED_DUMPING | MISSED_PAYMENT | VEHICLE_VIOLATION`

**Permissions:**
- Citizen: `read` (own only)
- Admin: `read`, `update`, `create`
- Worker: `read`, `create`

---

### 8. `notifications`

In-app/push notifications with multi-channel delivery tracking.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Auto-generated |
| `citizenId` | `string` | ✅ | — | Relation → `citizens.$id`. Indexed. |
| `type` | `enum` | ✅ | — | See **NotificationType** enum |
| `title` | `string` | ✅ | — | Short notification title |
| `message` | `string` | ✅ | — | Full message body |
| `read` | `boolean` | ✅ | `false` | Has the citizen opened it |
| `readAt` | `datetime` | ❌ | `null` | Exact timestamp of read |
| `delivered` | `boolean` | ✅ | `false` | Was delivery confirmed |
| `deliveredAt` | `datetime` | ❌ | `null` | Timestamp of delivery confirmation |
| `channel` | `enum` | ✅ | `IN_APP` | See **NotificationChannel** enum |
| `actionUrl` | `string` | ❌ | `null` | Deep-link URL for CTA |
| `createdAt` | `datetime` | ✅ | now | |
| `relatedComplaintId` | `string` | ❌ | `null` | Relation → `complaints.$id` |

**n8n Notification Workflow:**
```
Citizen creates complaint
  ↓ Appwrite saves complaint
  ↓ Triggers n8n webhook
  ↓ n8n creates Notification document (IN_APP)
  ↓ n8n sends Email → marks delivered=true, deliveredAt=now
  ↓ n8n sends Push notification
  ↓ n8n creates workflow_logs entry
  ↓ n8n updates complaint timeline
```

**Indexes:**
- `citizenId`
- `citizenId + read` — unread count
- `createdAt`

**Enums:**

**NotificationType:** `COMPLAINT_UPDATE | PICKUP_REMINDER | REWARD | ALERT | SURVEY`

**NotificationChannel:** `EMAIL | PUSH | SMS | IN_APP`

**Permissions:**
- Citizen: `read`, `update` (own — for marking read)
- Admin: `create`, `read` (all)
- n8n (API Key): `create`, `update`

---

### 9. `rewards`

Points ledger — one record per reward transaction.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Auto-generated |
| `citizenId` | `string` | ✅ | — | Relation → `citizens.$id`. Indexed. |
| `pointsAwarded` | `integer` | ✅ | — | Points credited |
| `reason` | `enum` | ✅ | — | See **RewardReason** enum |
| `createdAt` | `datetime` | ✅ | now | |

**Indexes:** `citizenId`, `createdAt`

**Enums:**

**RewardReason:** `SEGREGATION | SURVEY | COMPLAINT | COMPLIANCE | REFERRAL`

**Permissions:**
- Citizen: `read` (own only)
- Admin: `read`, `create`
- n8n (API Key): `create`

---

### 10. `workflow_logs` *(NEW)*

Audit trail for every automated action executed by n8n. Enables debugging, monitoring, and compliance reporting.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Auto-generated |
| `complaintId` | `string` | ✅ | — | Related complaint `$id` |
| `workflowName` | `string` | ✅ | — | e.g. `Complaint Automation`, `Reward Engine` |
| `action` | `string` | ✅ | — | e.g. `Worker Assigned`, `Email Sent`, `Notification Created` |
| `nodeName` | `string` | ❌ | `null` | n8n node name (e.g. `Send Email Node`) |
| `status` | `enum` | ✅ | — | `SUCCESS \| FAILED \| SKIPPED` |
| `message` | `string` | ❌ | `null` | Error detail or success message |
| `executedBy` | `string` | ✅ | — | `n8n`, `System`, or admin user ID |
| `executionId` | `string` | ❌ | `null` | n8n execution ID for cross-referencing |
| `createdAt` | `datetime` | ✅ | now | |

**Example records:**

```json
{ "complaintId": "CMP-2094", "workflowName": "Complaint Automation", "action": "Complaint Received", "status": "SUCCESS", "executedBy": "n8n", "executionId": "exec_abc123" }
{ "complaintId": "CMP-2094", "workflowName": "Complaint Automation", "action": "Worker Assigned", "nodeName": "Assign Worker Node", "status": "SUCCESS", "executedBy": "n8n" }
{ "complaintId": "CMP-2094", "workflowName": "Complaint Automation", "action": "Email Sent", "status": "FAILED", "message": "SMTP timeout", "executedBy": "n8n" }
```

**Indexes:**
- `complaintId` — look up all logs for a complaint
- `workflowName` — filter by workflow type
- `status` — filter failed runs
- `createdAt` — sort by time

**Permissions:**
- Admin: `read` (all)
- n8n (API Key): `create`

---

## Appwrite Auth

| User Type | Auth Method | Notes |
|---|---|---|
| Citizen | Email + Password | Profile linked to `citizens` collection via `$id` |
| Admin | Email + Password | Member of Appwrite Team: `admins` |
| Worker | Email + Password | Member of Appwrite Team: `workers` |

**Teams:**
- `admins` — Full database access
- `workers` — Limited to own route and assigned complaints
- `citizens` — Default self-registered users

---

## Appwrite Storage

### Bucket: `complaint_media`

| Setting | Value |
|---|---|
| Max file size | 5 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Read | Admin + file owner |
| Write | Authenticated citizen |
| Delete | Admin only |

### Bucket: `violation_evidence`

| Setting | Value |
|---|---|
| Max file size | 10 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Read | Admin + assigned worker |
| Write | Admin, Worker |
| Delete | Admin only |

---

## Appwrite Realtime

Replace polling with Appwrite Realtime subscriptions wherever possible.

| Collection | Subscribe For | Use Case |
|---|---|---|
| `complaints` | `databases.*.collections.complaints.documents` | Live complaint status on admin dashboard |
| `notifications` | `databases.*.collections.notifications.documents.*` | Instant in-app notification delivery |
| `vehicles` | `databases.*.collections.vehicles.documents` | Live map GPS updates |
| `routes` | `databases.*.collections.routes.documents` | Route completion progress bars |

> The current tracking engine polls every 5 seconds as a fallback. Switch to Realtime subscriptions. Benefits: instant updates, lower server load, better UX.

---

## n8n Integration Guidelines

**Architecture Rule:** Appwrite is the single source of truth. n8n only performs automation — it reads from Appwrite and writes back to Appwrite. n8n never stores business data internally.

```
Citizen
  ↓ (creates complaint via app)
Appwrite — saves complaint document
  ↓ (webhook trigger or polling)
n8n Workflow Starts
  ├─ Read complaint from Appwrite
  ├─ Query available workers (status=ACTIVE, isAvailable=true, wardCode=match)
  ├─ Update complaint: assignedToWorkerId, assignedToWorkerEmail, assignedAt, assignmentMethod=AUTO
  ├─ Update worker: isAvailable=false
  ├─ Create notification document in Appwrite
  ├─ Send email to worker (uses assignedToWorkerEmail — no extra query)
  ├─ Send email to citizen
  ├─ Create workflow_logs entry (action=Worker Assigned, status=SUCCESS)
  ├─ Append to complaint timeline
  └─ Return
```

**n8n should NOT:**
- Store complaint data in its own database
- Be the final authority on complaint state
- Send emails without creating a corresponding notification document

---

## Entity Relationships

```
citizens      ──< complaints        (1:N via citizenId)
citizens      ──< notifications     (1:N via citizenId)
citizens      ──< rewards           (1:N via citizenId)
citizens      ──< violations        (1:N via citizenId)

workers       ──< complaints        (1:N via assignedToWorkerId)
workers       ──> vehicles          (N:1 via assignedDriver)
workers       ──< routes            (1:N via workerId)
workers       ──< violations        (1:N via workerId)

vehicles      ──< routes            (1:N via vehicleId)

wards         ──< complaints        (1:N via wardCode)
wards         ──< workers           (1:N via wardCode)
wards         ──< routes            (1:N via wardCode)
wards         ──< violations        (1:N via wardCode)

complaints    ──< workflow_logs     (1:N via complaintId)
complaints    ──< notifications     (1:N via relatedComplaintId)
```

---

## Collection Summary

| # | Collection | Seed Records | Primary Key | Purpose |
|---|---|---|---|---|
| 1 | `complaints` | 150 | `$id` | Core complaint lifecycle + AI + audit |
| 2 | `citizens` | 100 | `$id` (= Auth UID) | Citizen profiles |
| 3 | `workers` | 50 | `$id` | Municipal staff |
| 4 | `vehicles` | 25 | `$id` | Fleet + live GPS |
| 5 | `routes` | 40 | `$id` | Collection routes + analytics |
| 6 | `wards` | 6 | `code` as `$id` | Static geography master |
| 7 | `violations` | 75 | `$id` | Compliance & fines |
| 8 | `notifications` | 100 | `$id` | Multi-channel notification delivery |
| 9 | `rewards` | 200 | `$id` | Points ledger |
| 10 | `workflow_logs` | — | `$id` | n8n execution audit trail |

---

## Implementation Notes

> **JSON attributes:** Appwrite does not support native nested object attributes. Store `location`, `bounds`, `checkpoints`, `deviations`, `evidence`, and `timeline` as **JSON string** attributes. Parse on the client.

> **Wards primary key:** Set the document `$id` to the ward `code` (e.g. `W01`) so you can call `databases.getDocument(dbId, 'wards', 'W01')` directly.

> **Denormalized counters:** `escalationCount`, `rewardPoints`, `pickupsCompleted`, `complaintsFiled`, `completionPercentage` are denormalized. Keep in sync using **Appwrite Functions** on document events to prevent race conditions.

> **Worker availability:** Always query `status=ACTIVE AND isAvailable=true` when n8n assigns complaints. Reset `isAvailable=true` when the worker completes their current task.

> **AI fields:** `aiCategory`, `aiConfidence`, `aiSummary` are optional placeholders. Populate via an n8n AI node (Gemini/OpenAI) after complaint creation. Do not block complaint creation on AI availability.

> **Realtime vs polling:** Use Appwrite Realtime subscriptions for complaints, notifications, vehicles, and routes. The 5-second polling loop is a fallback only.
