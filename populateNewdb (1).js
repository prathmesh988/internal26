import { Databases, ID, Query } from "node-appwrite";
import { client } from "./client.js";

const databases = new Databases(client);
const DATABASE_ID = "6a540f2e001dfabaccb5";

const now = () => new Date().toISOString();
const daysAgo  = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();

const doc = (col, id, data) =>
  databases.createDocument(DATABASE_ID, col, id ?? ID.unique(), data);

// ─────────────────────────────────────────────────────────────────────────────
// 1. WARDS  (use wardCode as $id for direct lookup)
// ─────────────────────────────────────────────────────────────────────────────
const WARDS = [
  { code: "W01", name: "Ward 01 – Sirpur",        zone: "West",    population: 28400, area: 4.2, bounds: JSON.stringify({ north: 22.715, south: 22.695, east: 75.830, west: 75.810 }) },
  { code: "W02", name: "Ward 02 – Chandan Nagar", zone: "West",    population: 35200, area: 6.1, bounds: JSON.stringify({ north: 22.705, south: 22.685, east: 75.835, west: 75.815 }) },
  { code: "W03", name: "Ward 03 – Kalani Nagar",  zone: "West",    population: 42100, area: 7.8, bounds: JSON.stringify({ north: 22.740, south: 22.720, east: 75.840, west: 75.820 }) },
  { code: "W04", name: "Ward 04 – Sukhdev Nagar", zone: "West",    population: 51300, area: 9.3, bounds: JSON.stringify({ north: 22.745, south: 22.725, east: 75.845, west: 75.825 }) },
  { code: "W05", name: "Ward 05 – Raj Nagar",     zone: "North",   population: 38700, area: 5.5, bounds: JSON.stringify({ north: 22.750, south: 22.730, east: 75.855, west: 75.835 }) },
  { code: "W06", name: "Ward 06 – Malharganj",    zone: "Central", population: 29600, area: 4.8, bounds: JSON.stringify({ north: 22.735, south: 22.715, east: 75.860, west: 75.840 }) },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. WORKERS
// ─────────────────────────────────────────────────────────────────────────────
const WORKERS = [
  // COLLECTOR
  { name: "Amit Verma",       email: "amit.verma@wasteflow.in",      phone: "9876543210", role: "COLLECTOR",     ward: "Ward 01 – Sirpur", wardCode: "W01", hireDate: "2022-03-15", lastActiveAt: hoursAgo(2) },
  { name: "Riya Singh",       email: "riya.singh@wasteflow.in",       phone: "9876543211", role: "COLLECTOR",     ward: "Ward 01 – Sirpur", wardCode: "W01", hireDate: "2021-07-01", lastActiveAt: hoursAgo(1) },
  { name: "Neha Sharma",      email: "neha.sharma@wasteflow.in",      phone: "9876543212", role: "COLLECTOR",     ward: "Ward 02 – Chandan Nagar",         wardCode: "W02", hireDate: "2023-01-10", lastActiveAt: hoursAgo(3) },
  { name: "Vikram Patel",     email: "vikram.patel@wasteflow.in",     phone: "9876543213", role: "COLLECTOR",     ward: "Ward 02 – Chandan Nagar",         wardCode: "W02", hireDate: "2020-11-20", lastActiveAt: hoursAgo(4) },
  { name: "Anjali Mehta",     email: "anjali.mehta@wasteflow.in",     phone: "9876543214", role: "COLLECTOR",     ward: "Ward 03 – Kalani Nagar",        wardCode: "W03", hireDate: "2022-06-05", lastActiveAt: hoursAgo(1) },
  { name: "Suresh Yadav",     email: "suresh.yadav@wasteflow.in",     phone: "9876543215", role: "COLLECTOR",     ward: "Ward 03 – Kalani Nagar",        wardCode: "W03", hireDate: "2021-09-15", lastActiveAt: hoursAgo(6) },
  { name: "Priya Joshi",      email: "priya.joshi@wasteflow.in",      phone: "9876543216", role: "COLLECTOR",     ward: "Ward 04 – Sukhdev Nagar",       wardCode: "W04", hireDate: "2023-03-01", isAvailable: false, lastActiveAt: hoursAgo(2) },
  { name: "Karan Shah",       email: "karan.shah@wasteflow.in",       phone: "9876543217", role: "COLLECTOR",     ward: "Ward 04 – Sukhdev Nagar",       wardCode: "W04", hireDate: "2020-05-20", lastActiveAt: hoursAgo(1) },
  { name: "Deepak Rao",       email: "deepak.rao@wasteflow.in",       phone: "9876543218", role: "COLLECTOR",     ward: "Ward 05 – Raj Nagar",         wardCode: "W05", hireDate: "2022-08-10", lastActiveAt: hoursAgo(3) },
  { name: "Sneha Kulkarni",   email: "sneha.kulkarni@wasteflow.in",   phone: "9876543219", role: "COLLECTOR",     ward: "Ward 05 – Raj Nagar",         wardCode: "W05", hireDate: "2021-12-01", lastActiveAt: hoursAgo(5) },
  { name: "Mohan Desai",      email: "mohan.desai@wasteflow.in",      phone: "9876543220", role: "COLLECTOR",     ward: "Ward 06 – Malharganj",    wardCode: "W06", hireDate: "2023-05-15", lastActiveAt: hoursAgo(2) },
  { name: "Lata Patil",       email: "lata.patil@wasteflow.in",       phone: "9876543221", role: "COLLECTOR",     ward: "Ward 06 – Malharganj",    wardCode: "W06", hireDate: "2022-02-20", lastActiveAt: hoursAgo(4) },
  // SUPERVISOR
  { name: "Rajesh Nair",      email: "rajesh.nair@wasteflow.in",      phone: "9876543222", role: "SUPERVISOR",    ward: "Ward 01 – Sirpur", wardCode: "W01", hireDate: "2019-04-01", lastActiveAt: hoursAgo(1) },
  { name: "Sunita Bose",      email: "sunita.bose@wasteflow.in",      phone: "9876543223", role: "SUPERVISOR",    ward: "Ward 02 – Chandan Nagar",         wardCode: "W02", hireDate: "2018-08-15", lastActiveAt: hoursAgo(2) },
  { name: "Arvind Kumar",     email: "arvind.kumar@wasteflow.in",     phone: "9876543224", role: "SUPERVISOR",    ward: "Ward 03 – Kalani Nagar",        wardCode: "W03", hireDate: "2019-11-01", lastActiveAt: hoursAgo(3) },
  { name: "Meena Iyer",       email: "meena.iyer@wasteflow.in",       phone: "9876543225", role: "SUPERVISOR",    ward: "Ward 04 – Sukhdev Nagar",       wardCode: "W04", hireDate: "2020-01-10", lastActiveAt: hoursAgo(1) },
  { name: "Gopal Thakur",     email: "gopal.thakur@wasteflow.in",     phone: "9876543226", role: "SUPERVISOR",    ward: "Ward 05 – Raj Nagar",         wardCode: "W05", hireDate: "2018-06-15", lastActiveAt: hoursAgo(4) },
  { name: "Kamla Devi",       email: "kamla.devi@wasteflow.in",       phone: "9876543227", role: "SUPERVISOR",    ward: "Ward 06 – Malharganj",    wardCode: "W06", hireDate: "2021-03-20", lastActiveAt: hoursAgo(2) },
  // OPERATOR
  { name: "Sanjay Gupta",     email: "sanjay.gupta@wasteflow.in",     phone: "9876543228", role: "OPERATOR",      ward: "Ward 01 – Sirpur", wardCode: "W01", hireDate: "2022-07-01", lastActiveAt: hoursAgo(1) },
  { name: "Priti More",       email: "priti.more@wasteflow.in",        phone: "9876543229", role: "OPERATOR",      ward: "Ward 02 – Chandan Nagar",         wardCode: "W02", hireDate: "2021-10-15", lastActiveAt: hoursAgo(3) },
  { name: "Ramesh Shinde",    email: "ramesh.shinde@wasteflow.in",    phone: "9876543230", role: "OPERATOR",      ward: "Ward 03 – Kalani Nagar",        wardCode: "W03", hireDate: "2023-02-01", lastActiveAt: hoursAgo(2) },
  { name: "Varsha Jadhav",    email: "varsha.jadhav@wasteflow.in",    phone: "9876543231", role: "OPERATOR",      ward: "Ward 04 – Sukhdev Nagar",       wardCode: "W04", hireDate: "2020-09-10", lastActiveAt: hoursAgo(5) },
  // ROUTE_PLANNER
  { name: "Nikhil Agarwal",   email: "nikhil.agarwal@wasteflow.in",   phone: "9876543232", role: "ROUTE_PLANNER", wardCode: "W01", ward: "Ward 01 – Sirpur", hireDate: "2019-06-01", lastActiveAt: hoursAgo(1) },
  { name: "Pooja Mishra",     email: "pooja.mishra@wasteflow.in",     phone: "9876543233", role: "ROUTE_PLANNER", wardCode: "W02", ward: "Ward 02 – Chandan Nagar",         hireDate: "2020-03-15", lastActiveAt: hoursAgo(2) },
  // ADMIN
  { name: "Dr. Sandeep Wagh", email: "sandeep.wagh@wasteflow.in",     phone: "9876543234", role: "ADMIN",         hireDate: "2017-01-01", lastActiveAt: hoursAgo(1) },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. VEHICLES
// ─────────────────────────────────────────────────────────────────────────────
const VEHICLES = [
  { registrationNumber: "MP-09-GQ-4920", type: "COMPACTOR",    capacity: 8000, currentLocation: JSON.stringify({ lat: 22.705, lng: 75.820 }), lastFueledAt: daysAgo(2) },
  { registrationNumber: "MP-09-GQ-4921", type: "COMPACTOR",    capacity: 8000, currentLocation: JSON.stringify({ lat: 22.695, lng: 75.825 }), lastFueledAt: daysAgo(1) },
  { registrationNumber: "MP-09-GQ-4922", type: "TIPPER",        capacity: 5000, currentLocation: JSON.stringify({ lat: 22.730, lng: 75.830 }), lastFueledAt: daysAgo(3) },
  { registrationNumber: "MP-09-GQ-4923", type: "TIPPER",        capacity: 5000, currentLocation: JSON.stringify({ lat: 22.735, lng: 75.835 }), lastFueledAt: daysAgo(1) },
  { registrationNumber: "MP-09-GQ-4924", type: "OPEN_BED",      capacity: 3000, currentLocation: JSON.stringify({ lat: 22.740, lng: 75.845 }), lastFueledAt: daysAgo(4) },
  { registrationNumber: "MP-09-GQ-4925", type: "OPEN_BED",      capacity: 3000, currentLocation: JSON.stringify({ lat: 22.725, lng: 75.850 }), lastFueledAt: daysAgo(2) },
  { registrationNumber: "MP-09-GQ-4926", type: "COMPACTOR",    capacity: 10000, status: "MAINTENANCE", currentLocation: JSON.stringify({ lat: 22.720, lng: 75.840 }), lastFueledAt: daysAgo(10) },
  { registrationNumber: "MP-09-GQ-4927", type: "SPECIAL_WASTE", capacity: 2000, currentLocation: JSON.stringify({ lat: 22.715, lng: 75.845 }), lastFueledAt: daysAgo(1) },
  { registrationNumber: "MP-09-GQ-4928", type: "TIPPER",        capacity: 6000, currentLocation: JSON.stringify({ lat: 22.725, lng: 75.835 }), lastFueledAt: daysAgo(2) },
  { registrationNumber: "MP-09-GQ-4929", type: "COMPACTOR",    capacity: 8000, status: "IN_USE", currentLoad: 4200, currentLocation: JSON.stringify({ lat: 22.730, lng: 75.845 }), lastFueledAt: daysAgo(1) },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. CITIZENS
// ─────────────────────────────────────────────────────────────────────────────
const CITIZEN_DATA = [
  ["Aisha Khan",       "aisha.khan@gmail.com",       "9800001001", "W01", "Ward 01 – Sirpur", "12, Sirpur Lake Road"],
  ["Rohit Kapoor",     "rohit.kapoor@gmail.com",     "9800001002", "W01", "Ward 01 – Sirpur", "45, Dhar Road"],
  ["Meera Nair",       "meera.nair@gmail.com",        "9800001003", "W01", "Ward 01 – Sirpur", "7, Bank Colony"],
  ["Arjun Malhotra",   "arjun.malhotra@gmail.com",   "9800001004", "W01", "Ward 01 – Sirpur", "23, Sirpur Village"],
  ["Divya Saxena",     "divya.saxena@gmail.com",      "9800001005", "W01", "Ward 01 – Sirpur", "88, Ring Road West"],
  ["Farhan Sheikh",    "farhan.sheikh@gmail.com",     "9800001006", "W02", "Ward 02 – Chandan Nagar", "3, Chandan Nagar Square"],
  ["Kavita Reddy",     "kavita.reddy@gmail.com",      "9800001007", "W02", "Ward 02 – Chandan Nagar", "56, Sector A"],
  ["Tarun Bansal",     "tarun.bansal@gmail.com",      "9800001008", "W02", "Ward 02 – Chandan Nagar", "14, Sector B"],
  ["Sunaina Pillai",   "sunaina.pillai@gmail.com",    "9800001009", "W02", "Ward 02 – Chandan Nagar", "29, Green Park Colony"],
  ["Harsh Agarwal",    "harsh.agarwal@gmail.com",     "9800001010", "W02", "Ward 02 – Chandan Nagar", "71, Rajnagar Extension"],
  ["Nisha Bhatt",      "nisha.bhatt@gmail.com",       "9800001011", "W03", "Ward 03 – Kalani Nagar", "4, Airport Road"],
  ["Siddharth Jain",   "siddharth.jain@gmail.com",    "9800001012", "W03", "Ward 03 – Kalani Nagar", "18, Kalani Nagar Main Road"],
  ["Pooja Tiwari",     "pooja.tiwari@gmail.com",      "9800001013", "W03", "Ward 03 – Kalani Nagar", "32, BSF Campus Road"],
  ["Akash Mehta",      "akash.mehta@gmail.com",       "9800001014", "W03", "Ward 03 – Kalani Nagar", "9, Super Corridor"],
  ["Ritu Sharma",      "ritu.sharma@gmail.com",       "9800001015", "W03", "Ward 03 – Kalani Nagar", "62, Ramchandra Nagar"],
  ["Imran Ali",        "imran.ali@gmail.com",          "9800001016", "W04", "Ward 04 – Sukhdev Nagar", "5, Sukhdev Nagar Main"],
  ["Priyanka Das",     "priyanka.das@gmail.com",      "9800001017", "W04", "Ward 04 – Sukhdev Nagar", "27, Kripa Colony"],
  ["Vikas Rao",        "vikas.rao@gmail.com",         "9800001018", "W04", "Ward 04 – Sukhdev Nagar", "11, Banganga"],
  ["Simran Kaur",      "simran.kaur@gmail.com",       "9800001019", "W04", "Ward 04 – Sukhdev Nagar", "84, Sanwer Road"],
  ["Ankit Verma",      "ankit.verma@gmail.com",       "9800001020", "W04", "Ward 04 – Sukhdev Nagar", "6, Industrial Area"],
  ["Geeta Deshmukh",   "geeta.deshmukh@gmail.com",   "9800001021", "W05", "Ward 05 – Raj Nagar", "33, Raj Nagar Extension"],
  ["Manoj Kumar",      "manoj.kumar@gmail.com",       "9800001022", "W05", "Ward 05 – Raj Nagar", "15, Gomagiri Road"],
  ["Lakshmi Iyer",     "lakshmi.iyer@gmail.com",      "9800001023", "W05", "Ward 05 – Raj Nagar", "47, Residency Area"],
  ["Rahul Pandey",     "rahul.pandey@gmail.com",      "9800001024", "W05", "Ward 05 – Raj Nagar", "2, Mahesh Guard Line"],
  ["Sneha Patil",      "sneha.patil@gmail.com",       "9800001025", "W05", "Ward 05 – Raj Nagar", "78, Polo Ground"],
  ["Ritesh Mishra",    "ritesh.mishra@gmail.com",     "9800001026", "W06", "Ward 06 – Malharganj", "19, Malharganj Square"],
  ["Aditi Ghosh",      "aditi.ghosh@gmail.com",       "9800001027", "W06", "Ward 06 – Malharganj", "42, Bada Ganpati Road"],
  ["Suraj Negi",       "suraj.negi@gmail.com",        "9800001028", "W06", "Ward 06 – Malharganj", "8, Gorakund"],
  ["Anjali Singh",     "anjali.singh@gmail.com",      "9800001029", "W06", "Ward 06 – Malharganj", "55, Jinsi"],
  ["Rohan Joshi",      "rohan.joshi@gmail.com",       "9800001030", "W06", "Ward 06 – Malharganj", "3, Jawahar Marg"],
];

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(2)); }

const CATEGORIES = ["MISSED_PICKUP","OVERFLOW","SPILL","ILLEGAL_DUMPING","SEGREGATION","VEHICLE_ISSUE","OTHER"];
const PRIORITIES  = ["LOW","MEDIUM","HIGH","CRITICAL"];
const C_STATUSES  = ["OPEN","ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED","ESCALATED","REJECTED"];
const VIOLATION_TYPES = ["IMPROPER_SEGREGATION","OVERFLOW_BIN","UNAUTHORIZED_DUMPING","MISSED_PAYMENT","VEHICLE_VIOLATION"];
const NOTIF_TYPES = ["COMPLAINT_UPDATE","PICKUP_REMINDER","REWARD","ALERT","SURVEY"];
const REWARD_REASONS = ["SEGREGATION","SURVEY","COMPLAINT","COMPLIANCE","REFERRAL"];
const W_CODES = ["W01","W02","W03","W04","W05","W06"];
const WARD_NAMES = {
  W01: "Ward 01 – Sirpur",
  W02: "Ward 02 – Chandan Nagar",
  W03: "Ward 03 – Kalani Nagar",
  W04: "Ward 04 – Sukhdev Nagar",
  W05: "Ward 05 – Raj Nagar",
  W06: "Ward 06 – Malharganj",
};

function makeLocation(wardCode) {
  const bases = { W01:[22.705, 75.820], W02:[22.695, 75.825], W03:[22.730, 75.830], W04:[22.735, 75.835], W05:[22.740, 75.845], W06:[22.725, 75.850] };
  const [lat, lng] = bases[wardCode] ?? [22.7196, 75.8577];
  return JSON.stringify({ lat: parseFloat((lat + (Math.random()-0.5)*0.01).toFixed(5)), lng: parseFloat((lng + (Math.random()-0.5)*0.01).toFixed(5)) });
}

function makeTimeline(status, createdAt) {
  const tl = [{ action: "Complaint Created", time: createdAt }];
  if (["ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED","ESCALATED"].includes(status))
    tl.push({ action: "Assigned to Worker", time: new Date(new Date(createdAt).getTime() + 30*60000).toISOString() });
  if (["IN_PROGRESS","RESOLVED","CLOSED"].includes(status))
    tl.push({ action: "Worker Started", time: new Date(new Date(createdAt).getTime() + 90*60000).toISOString() });
  if (["RESOLVED","CLOSED"].includes(status))
    tl.push({ action: "Resolved", time: new Date(new Date(createdAt).getTime() + 4*3600000).toISOString() });
  if (status === "ESCALATED")
    tl.push({ action: "Escalated to Level 2", time: new Date(new Date(createdAt).getTime() + 6*3600000).toISOString() });
  return JSON.stringify(tl);
}

const COMPLAINT_TITLES = {
  MISSED_PICKUP:    ["Garbage not collected since 3 days", "Missed pickup on main road", "Waste not picked up this week"],
  OVERFLOW:         ["Bin overflowing near bus stop", "Dustbin overflow on street corner", "Garbage bin full and overflowing"],
  SPILL:            ["Waste spilled on road", "Garbage scattered near market", "Spillage from collection vehicle"],
  ILLEGAL_DUMPING:  ["Illegal dumping near park", "Waste dumped in open plot", "Unauthorized waste disposal"],
  SEGREGATION:      ["Mixed waste collected without segregation", "Segregated bins not maintained", "Wet and dry waste mixed by collector"],
  VEHICLE_ISSUE:    ["Collection vehicle broken down", "Vehicle leaking waste on road", "Old vehicle causing mess"],
  OTHER:            ["General cleanliness issue", "Request for extra bin", "Complaint about waste management"],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function clearCollection(col) {
  console.log(`🧹 Clearing ${col}...`);
  try {
    let deletedCount = 0;
    while (true) {
      const res = await databases.listDocuments(DATABASE_ID, col, [Query.limit(100)]);
      if (res.documents.length === 0) break;
      for (const d of res.documents) {
        await databases.deleteDocument(DATABASE_ID, col, d.$id);
        deletedCount++;
      }
    }
    console.log(`  ✅ Deleted ${deletedCount} documents from ${col}`);
  } catch (err) {
    console.error(`  ❌ Error clearing ${col}:`, err.message);
  }
}

async function seed() {
  try {
    console.log("🔥 Starting full database reset...");
    const cols = ["wards", "workers", "vehicles", "citizens", "routes", "complaints", "violations", "notifications", "rewards", "workflow_logs"];
    for (const c of cols) await clearCollection(c);
    console.log("\n🚀 Proceeding to seed new Indore data...\n");

    // ── 1. Wards ────────────────────────────────────────────────────────────
    console.log("🌍 Seeding wards...");
    const wardIds = {};
    for (const w of WARDS) {
      await doc("wards", w.code, {
        code: w.code, name: w.name, zone: w.zone,
        population: w.population, area: w.area,
        averageResponseTime: randFloat(1.5, 8.5),
        bounds: w.bounds,
      });
      wardIds[w.code] = w.code;
      console.log(`  ✅ ${w.name}`);
    }

    // ── 2. Workers ──────────────────────────────────────────────────────────
    console.log("\n👷 Seeding workers...");
    const workerIds = [];
    const workersByWard = {};
    for (const w of WORKERS) {
      const id = ID.unique();
      const data = {
        name: w.name, email: w.email, phone: w.phone,
        role: w.role,
        status: w.status ?? "ACTIVE",
        isAvailable: w.isAvailable ?? true,
        ward: w.ward ?? null, wardCode: w.wardCode ?? null,
        hireDate: w.hireDate,
        lastActiveAt: w.lastActiveAt,
        totalPickups: randInt(50, 2000),
        totalComplaints: randInt(0, 10),
        completionRate: randFloat(80, 100),
        averageRating: randFloat(3.5, 5.0),
      };
      await doc("workers", id, data);
      const record = { id, ...data };
      workerIds.push(record);
      if (w.wardCode) {
        if (!workersByWard[w.wardCode]) workersByWard[w.wardCode] = [];
        workersByWard[w.wardCode].push(record);
      }
      console.log(`  ✅ ${w.name} (${w.role})`);
    }

    // ── 3. Vehicles ─────────────────────────────────────────────────────────
    console.log("\n🚛 Seeding vehicles...");
    const vehicleIds = [];
    for (const v of VEHICLES) {
      const id = ID.unique();
      const driver = pick(workerIds.filter(w => w.role === "OPERATOR"));
      const data = {
        registrationNumber: v.registrationNumber,
        type: v.type, capacity: v.capacity,
        currentLoad: v.currentLoad ?? 0,
        status: v.status ?? "IDLE",
        currentLocation: v.currentLocation,
        lastFueledAt: v.lastFueledAt,
        assignedDriver: driver.id,
        assignedDriverName: driver.name,
        fuelLevel: randInt(30, 100),
        totalMileage: randFloat(1000, 80000),
        speed: 0.0,
        heading: 0.0,
      };
      await doc("vehicles", id, data);
      vehicleIds.push({ id, ...data });
      console.log(`  ✅ ${v.registrationNumber}`);
    }

    // ── 4. Citizens ─────────────────────────────────────────────────────────
    console.log("\n👤 Seeding citizens...");
    const citizenIds = [];
    for (const [name, email, phone, wardCode, ward, address] of CITIZEN_DATA) {
      const id = ID.unique();
      const data = {
        name, email, phone, wardCode, ward, address,
        createdAt: daysAgo(randInt(10, 365)),
        lastActivityAt: daysAgo(randInt(0, 30)),
        rewardPoints: randInt(0, 500),
        completedSurveys: randInt(0, 15),
        complaintsFiled: randInt(0, 10),
        complianceScore: randInt(70, 100),
      };
      await doc("citizens", id, data);
      citizenIds.push({ id, name, email, wardCode, ward });
      console.log(`  ✅ ${name}`);
    }

    // ── 5. Routes ───────────────────────────────────────────────────────────
    console.log("\n🗺️  Seeding routes...");
    const routeStatuses = ["PLANNED","IN_PROGRESS","COMPLETED","FAILED"];
    const routeIds = [];
    for (let i = 0; i < 12; i++) {
      const wCode = W_CODES[i % 6];
      const wName = WARD_NAMES[wCode];
      const worker = pick(workersByWard[wCode] ?? workerIds);
      const vehicle = pick(vehicleIds);
      const status = pick(routeStatuses);
      const scheduledFor = i < 4 ? daysAhead(1) : daysAgo(randInt(1, 14));
      const pickupsScheduled = randInt(15, 40);
      const pickupsCompleted = status === "COMPLETED" ? pickupsScheduled
                             : status === "IN_PROGRESS" ? randInt(5, pickupsScheduled - 1)
                             : status === "FAILED" ? randInt(0, 10)
                             : 0;

      const checkpoints = Array.from({ length: 5 }, (_, ci) => ({
        id: `CP-${i+1}-${ci+1}`, sequence: ci + 1,
        location: JSON.parse(makeLocation(wCode)),
        address: `Stop ${ci + 1}, ${wName}`,
        expectedTime: new Date(new Date(scheduledFor).getTime() + ci * 30 * 60000).toISOString(),
        actualTime: status === "COMPLETED" ? new Date(new Date(scheduledFor).getTime() + ci * 32 * 60000).toISOString() : null,
        status: status === "COMPLETED" ? "COMPLETED" : ci < pickupsCompleted ? "COMPLETED" : "PENDING",
        pickupCount: randInt(8, 25),
      }));

      const id = ID.unique();
      const data = {
        name: `Route ${wCode}-${String(i+1).padStart(2,"0")}`,
        ward: wName, wardCode: wCode,
        vehicleId: vehicle.id,
        workerId: worker.id,
        workerName: worker.name,
        status,
        scheduledFor,
        startedAt: ["IN_PROGRESS","COMPLETED","FAILED"].includes(status) ? new Date(new Date(scheduledFor).getTime() + 5*60000).toISOString() : null,
        completedAt: status === "COMPLETED" ? new Date(new Date(scheduledFor).getTime() + 3*3600000).toISOString() : null,
        checkpoints: JSON.stringify(checkpoints),
        deviations: JSON.stringify([]),
        distance: randFloat(8, 25),
        estimatedDuration: randInt(90, 240),
        actualDuration: status === "COMPLETED" ? randInt(100, 260) : null,
        pickupsScheduled,
        pickupsCompleted,
        missedCheckpoints: pickupsScheduled - pickupsCompleted,
        delayMinutes: status === "COMPLETED" ? randInt(0, 30) : 0,
        efficiency: parseFloat(((pickupsCompleted / pickupsScheduled) * 100).toFixed(1)),
        completionPercentage: parseFloat(((pickupsCompleted / pickupsScheduled) * 100).toFixed(1)),
      };
      await doc("routes", id, data);
      routeIds.push(id);
      console.log(`  ✅ ${data.name} [${status}]`);
    }

    // ── 6. Complaints ───────────────────────────────────────────────────────
    console.log("\n📋 Seeding complaints...");
    const complaintIds = [];
    for (let i = 0; i < 40; i++) {
      const citizen = pick(citizenIds);
      const wCode = citizen.wardCode;
      const wName = citizen.ward;
      const category = pick(CATEGORIES);
      const priority = pick(PRIORITIES);
      const status = pick(C_STATUSES);
      const createdAt = daysAgo(randInt(0, 60));
      const worker = pick(workersByWard[wCode] ?? workerIds);
      const isAssigned = ["ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED","ESCALATED"].includes(status);
      const isResolved = ["RESOLVED","CLOSED"].includes(status);

      const id = ID.unique();
      const data = {
        citizenId: citizen.id,
        filedByCitizenId: citizen.id,
        ward: wName, wardCode: wCode,
        category, priority, status,
        title: pick(COMPLAINT_TITLES[category]),
        description: `Complaint filed by ${citizen.name}. Issue reported at ${wName}. Requires immediate attention from the waste management team.`,
        location: makeLocation(wCode),
        createdAt,
        updatedAt: isAssigned ? new Date(new Date(createdAt).getTime() + 30*60000).toISOString() : createdAt,
        timeline: makeTimeline(status, createdAt),
        // assignment
        assignedToWorkerId:    isAssigned ? worker.id : null,
        assignedToWorkerName:  isAssigned ? worker.name : null,
        assignedToWorkerEmail: isAssigned ? worker.email : null,
        assignedAt:   isAssigned ? new Date(new Date(createdAt).getTime() + 25*60000).toISOString() : null,
        assignedBy:   isAssigned ? "System" : null,
        assignmentMethod: isAssigned ? "AUTO" : null,
        // resolution
        resolvedAt:             isResolved ? new Date(new Date(createdAt).getTime() + 4*3600000).toISOString() : null,
        resolvedByWorkerId:     isResolved ? worker.id : null,
        resolvedByWorkerName:   isResolved ? worker.name : null,
        resolutionNotes:        isResolved ? "Issue resolved. Area cleaned and waste collected." : null,
        resolutionDuration:     isResolved ? randInt(60, 480) : null,
        // analytics
        responseTime:    isAssigned ? randInt(10, 120) : null,
        firstResponseAt: isAssigned ? new Date(new Date(createdAt).getTime() + 20*60000).toISOString() : null,
        // escalation
        escalationCount: status === "ESCALATED" ? 1 : 0,
        escalatedAt:     status === "ESCALATED" ? new Date(new Date(createdAt).getTime() + 6*3600000).toISOString() : null,
        escalationLevel: status === "ESCALATED" ? "LEVEL_1" : null,
        escalationReason: status === "ESCALATED" ? "No action taken within SLA window" : null,
        escalatedBy: status === "ESCALATED" ? "System" : null,
      };
      await doc("complaints", id, data);
      complaintIds.push({ id, citizenId: citizen.id, citizenEmail: citizen.email, wardCode: wCode, wName });
      process.stdout.write(`  ✅ ${i+1}/40\r`);
    }
    console.log("\n  ✅ 40 complaints seeded");

    // ── 7. Violations ───────────────────────────────────────────────────────
    console.log("\n⚠️  Seeding violations...");
    for (let i = 0; i < 20; i++) {
      const citizen = pick(citizenIds);
      const worker  = pick(workerIds);
      const wCode   = citizen.wardCode;
      const createdAt = daysAgo(randInt(1, 90));
      const vStatus = pick(["OPEN","OPEN","RESOLVED","APPEALED"]);
      await doc("violations", null, {
        citizenId: citizen.id, citizenName: citizen.name,
        workerId: worker.id,   workerName: worker.name,
        type: pick(VIOLATION_TYPES),
        severity: pick(["LOW","MEDIUM","HIGH"]),
        description: "Violation detected during routine inspection. Non-compliance with municipal waste management guidelines.",
        location: makeLocation(wCode),
        ward: WARD_NAMES[wCode], wardCode: wCode,
        fineAmount: parseFloat(pick(["500","1000","1500","2000","5000"])),
        status: vStatus,
        createdAt,
        resolvedAt: vStatus === "RESOLVED" ? new Date(new Date(createdAt).getTime() + 7*86400000).toISOString() : null,
        evidence: JSON.stringify([]),
      });
      process.stdout.write(`  ✅ ${i+1}/20\r`);
    }
    console.log("\n  ✅ 20 violations seeded");

    // ── 8. Notifications ────────────────────────────────────────────────────
    console.log("\n🔔 Seeding notifications...");
    for (let i = 0; i < 30; i++) {
      const citizen    = pick(citizenIds);
      const complaint  = pick(complaintIds);
      const type       = pick(NOTIF_TYPES);
      const isRead     = Math.random() > 0.4;
      const isDelivered = Math.random() > 0.1;
      const createdAt  = daysAgo(randInt(0, 30));
      const titles = {
        COMPLAINT_UPDATE:  "Your complaint has been updated",
        PICKUP_REMINDER:   "Waste pickup scheduled for tomorrow",
        REWARD:            "You earned reward points!",
        ALERT:             "Action required: Compliance notice",
        SURVEY:            "Share your feedback",
      };
      await doc("notifications", null, {
        citizenId: citizen.id,
        type,
        title: titles[type],
        message: `Dear ${citizen.name}, ${titles[type].toLowerCase()}. Please check the WasteFlow app for details.`,
        read: isRead,
        readAt: isRead ? new Date(new Date(createdAt).getTime() + randInt(10, 120)*60000).toISOString() : null,
        delivered: isDelivered,
        deliveredAt: isDelivered ? new Date(new Date(createdAt).getTime() + 5000).toISOString() : null,
        channel: pick(["IN_APP","EMAIL","PUSH"]),
        createdAt,
        relatedComplaintId: type === "COMPLAINT_UPDATE" ? complaint.id : null,
      });
      process.stdout.write(`  ✅ ${i+1}/30\r`);
    }
    console.log("\n  ✅ 30 notifications seeded");

    // ── 9. Rewards ──────────────────────────────────────────────────────────
    console.log("\n🏆 Seeding rewards...");
    for (let i = 0; i < 50; i++) {
      const citizen = pick(citizenIds);
      await doc("rewards", null, {
        citizenId: citizen.id,
        pointsAwarded: pick([10, 25, 50, 100, 200]),
        reason: pick(REWARD_REASONS),
        createdAt: daysAgo(randInt(0, 180)),
      });
      process.stdout.write(`  ✅ ${i+1}/50\r`);
    }
    console.log("\n  ✅ 50 rewards seeded");

    // ── 10. Workflow Logs ───────────────────────────────────────────────────
    console.log("\n📝 Seeding workflow_logs...");
    const logActions = [
      { action: "Complaint Received",    node: "Webhook Trigger",    status: "SUCCESS" },
      { action: "Worker Assigned",       node: "Assign Worker Node", status: "SUCCESS" },
      { action: "Email Sent to Worker",  node: "Send Email Node",    status: "SUCCESS" },
      { action: "Email Sent to Citizen", node: "Send Email Node",    status: "SUCCESS" },
      { action: "Notification Created",  node: "Create Notification",status: "SUCCESS" },
      { action: "Worker Assigned",       node: "Assign Worker Node", status: "FAILED",  message: "No available workers in ward" },
      { action: "Email Sent",            node: "Send Email Node",    status: "FAILED",  message: "SMTP timeout" },
    ];
    for (let i = 0; i < 30; i++) {
      const complaint = pick(complaintIds);
      const entry = pick(logActions);
      await doc("workflow_logs", null, {
        complaintId:  complaint.id,
        workflowName: "Complaint Automation",
        action:       entry.action,
        nodeName:     entry.node,
        status:       entry.status,
        message:      entry.message ?? null,
        executedBy:   "n8n",
        executionId:  `exec_${Math.random().toString(36).slice(2, 10)}`,
        createdAt:    daysAgo(randInt(0, 30)),
      });
      process.stdout.write(`  ✅ ${i+1}/30\r`);
    }
    console.log("\n  ✅ 30 workflow_logs seeded");

    // ── Done ────────────────────────────────────────────────────────────────
    console.log("\n════════════════════════════════════════");
    console.log("🎉  WASTEFLOW SEED DATA COMPLETE");
    console.log("════════════════════════════════════════");
    console.log(`  6  wards       ✅`);
    console.log(`  ${WORKERS.length}  workers     ✅`);
    console.log(`  ${VEHICLES.length}  vehicles    ✅`);
    console.log(`  ${CITIZEN_DATA.length}  citizens    ✅`);
    console.log(`  12  routes      ✅`);
    console.log(`  40  complaints  ✅`);
    console.log(`  20  violations  ✅`);
    console.log(`  30  notifications ✅`);
    console.log(`  50  rewards     ✅`);
    console.log(`  30  workflow_logs ✅`);

  } catch (err) {
    console.error("\n❌ Seed failed:", err.message ?? err);
    process.exit(1);
  }
}

seed();
