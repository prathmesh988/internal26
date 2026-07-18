import { Databases, ID, Permission, Role, DatabasesIndexType } from "node-appwrite";
import { client } from "./client.js";

const databases = new Databases(client);

const DB_NAME = "wasteflow_db";
const DATABASE_ID = ID.unique();

// ─── helpers ─────────────────────────────────────────────────────────────────
// Appwrite rule: required=true attrs CANNOT have a default value.
// Use required=false + default for auto-filled counters/scores.

const str  = (dbId, col, key, size = 255, required = true, def = undefined) =>
  databases.createStringAttribute(dbId, col, key, size, required, def);

const int  = (dbId, col, key, required = true, min = undefined, max = undefined, def = undefined) =>
  databases.createIntegerAttribute(dbId, col, key, required, min, max, def);

const flt  = (dbId, col, key, required = false, min = undefined, max = undefined, def = undefined) =>
  databases.createFloatAttribute(dbId, col, key, required, min, max, def);

const bool = (dbId, col, key, required = true, def = undefined) =>
  databases.createBooleanAttribute(dbId, col, key, required, def);

const dt   = (dbId, col, key, required = true) =>
  databases.createDatetimeAttribute(dbId, col, key, required);

const enm  = (dbId, col, key, values, required = true, def = undefined) =>
  databases.createEnumAttribute(dbId, col, key, values, required, def);

const idx  = (dbId, col, key, attrs, type = DatabasesIndexType.Key) =>
  databases.createIndex(dbId, col, key, type, attrs);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const pause = () => sleep(3000); // wait for Appwrite to propagate attributes

// ─── setup ────────────────────────────────────────────────────────────────────

async function setup() {
  try {
    const db = await databases.create(DATABASE_ID, DB_NAME);
    const dbId = db.$id;
    console.log(`✅ Database created  →  ID: ${dbId}\n`);

    // ══════════════════════════════════════════════════════════════════════════
    // 1. complaints
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "complaints", "Complaints", [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.team("admins")),
      Permission.update(Role.team("workers")),
      Permission.delete(Role.team("admins")),
    ]);

    await str(dbId, "complaints", "citizenId",       36);
    await str(dbId, "complaints", "filedByCitizenId",36);
    await str(dbId, "complaints", "ward",           100);
    await str(dbId, "complaints", "wardCode",        10);
    // required enums — no default allowed
    await enm(dbId, "complaints", "category",
      ["MISSED_PICKUP","OVERFLOW","SPILL","ILLEGAL_DUMPING","SEGREGATION","VEHICLE_ISSUE","OTHER"]);
    await str(dbId, "complaints", "title",          100);
    await str(dbId, "complaints", "description",    500);
    await str(dbId, "complaints", "location",       500);   // JSON {lat,lng}
    await enm(dbId, "complaints", "status",
      ["OPEN","ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED","ESCALATED","REJECTED"]);
    await enm(dbId, "complaints", "priority",
      ["LOW","MEDIUM","HIGH","CRITICAL"]);
    await str(dbId, "complaints", "imageUrl",       500, false);
    await dt (dbId, "complaints", "createdAt");
    await dt (dbId, "complaints", "updatedAt");
    // assignment (all optional)
    await str(dbId, "complaints", "assignedToWorkerId",    36,  false);
    await str(dbId, "complaints", "assignedToWorkerName", 150,  false);
    await str(dbId, "complaints", "assignedToWorkerEmail",255,  false);
    await dt (dbId, "complaints", "assignedAt",           false);
    await str(dbId, "complaints", "assignedBy",           100,  false);
    await enm(dbId, "complaints", "assignmentMethod", ["AUTO","MANUAL"], false);
    // resolution (all optional)
    await str(dbId, "complaints", "resolutionNotes",      500, false);
    await dt (dbId, "complaints", "resolvedAt",           false);
    await str(dbId, "complaints", "resolvedByWorkerId",    36, false);
    await str(dbId, "complaints", "resolvedByWorkerName", 150, false);
    await int(dbId, "complaints", "resolutionDuration",   false);
    // analytics (all optional)
    await int(dbId, "complaints", "responseTime",         false);
    await dt (dbId, "complaints", "firstResponseAt",      false);
    await str(dbId, "complaints", "estimatedResolutionTime", 100, false);
    // escalation — counter uses false+default
    await int(dbId, "complaints", "escalationCount", false, 0, undefined, 0);
    await dt (dbId, "complaints", "escalatedAt",     false);
    await str(dbId, "complaints", "escalationReason",200, false);
    await str(dbId, "complaints", "escalatedBy",    100, false);
    await enm(dbId, "complaints", "escalationLevel", ["LEVEL_1","LEVEL_2","LEVEL_3"], false);
    // timeline (required, no default — caller must supply "[]")
    await str(dbId, "complaints", "timeline", 5000, true);
    // AI fields (all optional)
    await str(dbId, "complaints", "aiCategory",  100, false);
    await flt(dbId, "complaints", "aiConfidence",false, 0, 1);
    await str(dbId, "complaints", "aiSummary",   500, false);

    await pause();
    await idx(dbId, "complaints", "idx_wardCode",  ["wardCode"]);
    await idx(dbId, "complaints", "idx_status",    ["status"]);
    await idx(dbId, "complaints", "idx_priority",  ["priority"]);
    await idx(dbId, "complaints", "idx_createdAt", ["createdAt"]);
    await idx(dbId, "complaints", "idx_citizenId", ["citizenId"]);
    console.log("✅ complaints");

    // ══════════════════════════════════════════════════════════════════════════
    // 2. citizens
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "citizens", "Citizens", [
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.read(Role.team("admins")),
      Permission.update(Role.team("admins")),
    ]);

    await str(dbId, "citizens", "email",           255);
    await str(dbId, "citizens", "name",            150);
    await str(dbId, "citizens", "phone",            20);
    await str(dbId, "citizens", "ward",            100);
    await str(dbId, "citizens", "wardCode",         10);
    await str(dbId, "citizens", "address",         255);
    // counters — optional with default 0/100
    await int(dbId, "citizens", "rewardPoints",    false, 0, undefined, 0);
    await int(dbId, "citizens", "completedSurveys",false, 0, undefined, 0);
    await int(dbId, "citizens", "complaintsFiled", false, 0, undefined, 0);
    await int(dbId, "citizens", "complianceScore", false, 0, 100, 100);
    await dt (dbId, "citizens", "createdAt");
    await dt (dbId, "citizens", "lastActivityAt");

    await pause();
    await idx(dbId, "citizens", "idx_wardCode", ["wardCode"]);
    await idx(dbId, "citizens", "idx_email",    ["email"], DatabasesIndexType.Unique);
    console.log("✅ citizens");

    // ══════════════════════════════════════════════════════════════════════════
    // 3. workers
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "workers", "Workers", [
      Permission.read(Role.team("admins")),
      Permission.update(Role.team("admins")),
      Permission.delete(Role.team("admins")),
      Permission.read(Role.team("workers")),
    ]);

    await str(dbId, "workers", "name",  150);
    await str(dbId, "workers", "email", 255);
    await str(dbId, "workers", "phone",  20);
    await enm(dbId, "workers", "role",
      ["COLLECTOR","SUPERVISOR","OPERATOR","ROUTE_PLANNER","ADMIN"]);
    await enm(dbId, "workers", "status",
      ["ACTIVE","ON_LEAVE","INACTIVE","SUSPENDED","MAINTENANCE"]);
    await bool(dbId, "workers", "isAvailable", false, true);   // optional, default true
    await str(dbId, "workers", "assignedVehicle",  50,  false);
    await str(dbId, "workers", "ward",            100,  false);
    await str(dbId, "workers", "wardCode",         10,  false);
    await flt(dbId, "workers", "completionRate",  false, 0, 100, 100.0);
    await flt(dbId, "workers", "averageRating",   false, 1.0, 5.0, 5.0);
    await int(dbId, "workers", "totalPickups",    false, 0, undefined, 0);
    await int(dbId, "workers", "totalComplaints", false, 0, undefined, 0);
    await str(dbId, "workers", "hireDate",         10);  // YYYY-MM-DD, required
    await dt (dbId, "workers", "lastActiveAt");

    await pause();
    await idx(dbId, "workers", "idx_wardCode",    ["wardCode"]);
    await idx(dbId, "workers", "idx_status",      ["status"]);
    await idx(dbId, "workers", "idx_isAvailable", ["isAvailable"]);
    await idx(dbId, "workers", "idx_role",        ["role"]);
    console.log("✅ workers");

    // ══════════════════════════════════════════════════════════════════════════
    // 4. vehicles
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "vehicles", "Vehicles", [
      Permission.read(Role.team("admins")),
      Permission.update(Role.team("admins")),
      Permission.read(Role.team("workers")),
    ]);

    await str(dbId, "vehicles", "registrationNumber", 30);
    await enm(dbId, "vehicles", "type",
      ["COMPACTOR","TIPPER","OPEN_BED","SPECIAL_WASTE"]);
    await int(dbId, "vehicles", "capacity",      true, 1);        // required, no default
    await int(dbId, "vehicles", "currentLoad",   false, 0, undefined, 0);
    await enm(dbId, "vehicles", "status",
      ["IDLE","IN_USE","MAINTENANCE","FUEL","END_OF_DAY"]);
    await str(dbId, "vehicles", "currentLocation",    200);  // JSON {lat,lng}, required
    await dt (dbId, "vehicles", "lastLocationUpdate", false);
    await flt(dbId, "vehicles", "speed",   false, 0, undefined, 0.0);
    await flt(dbId, "vehicles", "heading", false, 0.0, 360.0, 0.0);
    await str(dbId, "vehicles", "assignedDriver",    36,  false);
    await str(dbId, "vehicles", "assignedDriverName",150, false);
    await str(dbId, "vehicles", "route",              36, false);
    await dt (dbId, "vehicles", "lastFueledAt");
    await dt (dbId, "vehicles", "maintenanceDueAt",  false);
    await int(dbId, "vehicles", "fuelLevel",    false, 0, 100, 100);
    await flt(dbId, "vehicles", "totalMileage", false, 0, undefined, 0.0);

    await pause();
    await idx(dbId, "vehicles", "idx_status",             ["status"]);
    await idx(dbId, "vehicles", "idx_registrationNumber", ["registrationNumber"], DatabasesIndexType.Unique);
    console.log("✅ vehicles");

    // ══════════════════════════════════════════════════════════════════════════
    // 5. routes
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "routes", "Routes", [
      Permission.read(Role.team("admins")),
      Permission.update(Role.team("admins")),
      Permission.read(Role.team("workers")),
      Permission.update(Role.team("workers")),
    ]);

    await str(dbId, "routes", "name",     200);
    await str(dbId, "routes", "ward",     100);
    await str(dbId, "routes", "wardCode",  10);
    await str(dbId, "routes", "vehicleId", 36, false);
    await str(dbId, "routes", "workerId",  36, false);
    await str(dbId, "routes", "workerName",150, false);
    await enm(dbId, "routes", "status",
      ["PLANNED","IN_PROGRESS","COMPLETED","FAILED"]);
    await dt (dbId, "routes", "scheduledFor");
    await dt (dbId, "routes", "startedAt",   false);
    await dt (dbId, "routes", "completedAt", false);
    await str(dbId, "routes", "checkpoints", 5000);  // JSON [], required
    await flt(dbId, "routes", "distance",    true, 0);
    await int(dbId, "routes", "estimatedDuration", true, 1);
    await int(dbId, "routes", "actualDuration",    false);
    await int(dbId, "routes", "pickupsScheduled",  false, 0, undefined, 0);
    await int(dbId, "routes", "pickupsCompleted",  false, 0, undefined, 0);
    await flt(dbId, "routes", "efficiency",        false, 0, 100, 100.0);
    await str(dbId, "routes", "deviations",        5000);  // JSON [], required
    await int(dbId, "routes", "missedCheckpoints", false, 0, undefined, 0);
    await int(dbId, "routes", "delayMinutes",      false, 0, undefined, 0);
    await flt(dbId, "routes", "completionPercentage", false, 0, 100, 0.0);

    await pause();
    await idx(dbId, "routes", "idx_wardCode",    ["wardCode"]);
    await idx(dbId, "routes", "idx_status",      ["status"]);
    await idx(dbId, "routes", "idx_scheduledFor",["scheduledFor"]);
    console.log("✅ routes");

    // ══════════════════════════════════════════════════════════════════════════
    // 6. wards
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "wards", "Wards", [
      Permission.read(Role.any()),
      Permission.update(Role.team("admins")),
    ]);

    await str(dbId, "wards", "code",  10);
    await str(dbId, "wards", "name", 150);
    await str(dbId, "wards", "zone", 100);
    await int(dbId, "wards", "population", true, 0);
    await flt(dbId, "wards", "area",       true, 0);
    await int(dbId, "wards", "complaintCount",        false, 0, undefined, 0);
    await flt(dbId, "wards", "averageResponseTime",   false, 0, undefined, 0.0);
    await int(dbId, "wards", "cleanlinessScore",      false, 0, 100, 100);
    await int(dbId, "wards", "pickupsScheduledToday", false, 0, undefined, 0);
    await int(dbId, "wards", "pickupsCompletedToday", false, 0, undefined, 0);
    await int(dbId, "wards", "citizens",              false, 0, undefined, 0);
    await str(dbId, "wards", "bounds", 500);  // JSON {n,s,e,w}, required

    await pause();
    await idx(dbId, "wards", "idx_code", ["code"], DatabasesIndexType.Unique);
    console.log("✅ wards");

    // ══════════════════════════════════════════════════════════════════════════
    // 7. violations
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "violations", "Violations", [
      Permission.read(Role.users()),
      Permission.create(Role.team("admins")),
      Permission.create(Role.team("workers")),
      Permission.update(Role.team("admins")),
      Permission.read(Role.team("admins")),
    ]);

    await str(dbId, "violations", "citizenId",   36,  false);
    await str(dbId, "violations", "citizenName", 150, false);
    await str(dbId, "violations", "workerId",    36,  false);
    await str(dbId, "violations", "workerName",  150, false);
    await enm(dbId, "violations", "type",
      ["IMPROPER_SEGREGATION","OVERFLOW_BIN","UNAUTHORIZED_DUMPING","MISSED_PAYMENT","VEHICLE_VIOLATION"]);
    await enm(dbId, "violations", "severity", ["LOW","MEDIUM","HIGH"]);
    await str(dbId, "violations", "description", 500);
    await str(dbId, "violations", "location",    200);
    await str(dbId, "violations", "ward",        100);
    await str(dbId, "violations", "wardCode",     10);
    await flt(dbId, "violations", "fineAmount",  false, 0, undefined, 0.0);
    await enm(dbId, "violations", "status", ["OPEN","RESOLVED","APPEALED"]);
    await dt (dbId, "violations", "createdAt");
    await dt (dbId, "violations", "resolvedAt", false);
    await str(dbId, "violations", "evidence",   2000, false);  // JSON []

    await pause();
    await idx(dbId, "violations", "idx_wardCode",  ["wardCode"]);
    await idx(dbId, "violations", "idx_status",    ["status"]);
    await idx(dbId, "violations", "idx_createdAt", ["createdAt"]);
    await idx(dbId, "violations", "idx_citizenId", ["citizenId"]);
    console.log("✅ violations");

    // ══════════════════════════════════════════════════════════════════════════
    // 8. notifications
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "notifications", "Notifications", [
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.create(Role.team("admins")),
      Permission.read(Role.team("admins")),
    ]);

    await str(dbId, "notifications", "citizenId", 36);
    await enm(dbId, "notifications", "type",
      ["COMPLAINT_UPDATE","PICKUP_REMINDER","REWARD","ALERT","SURVEY"]);
    await str(dbId, "notifications", "title",   150);
    await str(dbId, "notifications", "message", 500);
    await bool(dbId, "notifications", "read",      false, false);
    await dt  (dbId, "notifications", "readAt",    false);
    await bool(dbId, "notifications", "delivered", false, false);
    await dt  (dbId, "notifications", "deliveredAt", false);
    await enm(dbId, "notifications", "channel",
      ["EMAIL","PUSH","SMS","IN_APP"]);
    await str(dbId, "notifications", "actionUrl",         500, false);
    await dt (dbId, "notifications", "createdAt");
    await str(dbId, "notifications", "relatedComplaintId", 36, false);

    await pause();
    await idx(dbId, "notifications", "idx_citizenId",      ["citizenId"]);
    await idx(dbId, "notifications", "idx_citizenId_read", ["citizenId","read"]);
    await idx(dbId, "notifications", "idx_createdAt",      ["createdAt"]);
    console.log("✅ notifications");

    // ══════════════════════════════════════════════════════════════════════════
    // 9. rewards
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "rewards", "Rewards", [
      Permission.read(Role.users()),
      Permission.create(Role.team("admins")),
      Permission.read(Role.team("admins")),
    ]);

    await str(dbId, "rewards", "citizenId",    36);
    await int(dbId, "rewards", "pointsAwarded",true, 1);
    await enm(dbId, "rewards", "reason",
      ["SEGREGATION","SURVEY","COMPLAINT","COMPLIANCE","REFERRAL"]);
    await dt (dbId, "rewards", "createdAt");

    await pause();
    await idx(dbId, "rewards", "idx_citizenId", ["citizenId"]);
    await idx(dbId, "rewards", "idx_createdAt", ["createdAt"]);
    console.log("✅ rewards");

    // ══════════════════════════════════════════════════════════════════════════
    // 10. workflow_logs
    // ══════════════════════════════════════════════════════════════════════════
    await databases.createCollection(dbId, "workflow_logs", "Workflow Logs", [
      Permission.read(Role.team("admins")),
    ]);

    await str(dbId, "workflow_logs", "complaintId",  36);
    await str(dbId, "workflow_logs", "workflowName", 100);
    await str(dbId, "workflow_logs", "action",        100);
    await str(dbId, "workflow_logs", "nodeName",      100, false);
    await enm(dbId, "workflow_logs", "status",
      ["SUCCESS","FAILED","SKIPPED"]);
    await str(dbId, "workflow_logs", "message",      500, false);
    await str(dbId, "workflow_logs", "executedBy",   100);
    await str(dbId, "workflow_logs", "executionId",  100, false);
    await dt (dbId, "workflow_logs", "createdAt");

    await pause();
    await idx(dbId, "workflow_logs", "idx_complaintId",  ["complaintId"]);
    await idx(dbId, "workflow_logs", "idx_workflowName", ["workflowName"]);
    await idx(dbId, "workflow_logs", "idx_status",       ["status"]);
    await idx(dbId, "workflow_logs", "idx_createdAt",    ["createdAt"]);
    console.log("✅ workflow_logs");

    // ── Done ──────────────────────────────────────────────────────────────────
    console.log("\n────────────────────────────────────────");
    console.log("🎉  WASTEFLOW DB SETUP COMPLETE");
    console.log("────────────────────────────────────────");
    console.log(`Database ID: ${dbId}`);
    console.log("Paste the Database ID above into populateNewdb.js → DATABASE_ID");

  } catch (err) {
    console.error("❌ Setup failed:", err.message ?? err);
    process.exit(1);
  }
}

// Delete any existing DB first, then recreate (handles free-plan 1-db limit)
async function deleteExistingAndSetup() {
  const list = await databases.list();
  for (const db of list.databases) {
    console.log(`🗑  Deleting existing DB: ${db.name} (${db.$id})`);
    await databases.delete(db.$id);
  }
  await setup();
}

deleteExistingAndSetup();
