import { Databases, ID } from "node-appwrite";
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
  { code: "W01", name: "Ward 01 – Shivaji Nagar",   zone: "North", population: 28400, area: 4.2,  bounds: JSON.stringify({ north: 18.560, south: 18.530, east: 73.870, west: 73.840 }) },
  { code: "W02", name: "Ward 02 – Aundh",            zone: "North", population: 35200, area: 6.1,  bounds: JSON.stringify({ north: 18.575, south: 18.540, east: 73.820, west: 73.790 }) },
  { code: "W03", name: "Ward 03 – Kothrud",          zone: "West",  population: 42100, area: 7.8,  bounds: JSON.stringify({ north: 18.510, south: 18.480, east: 73.820, west: 73.780 }) },
  { code: "W04", name: "Ward 04 – Hadapsar",         zone: "East",  population: 51300, area: 9.3,  bounds: JSON.stringify({ north: 18.500, south: 18.460, east: 73.960, west: 73.920 }) },
  { code: "W05", name: "Ward 05 – Katraj",           zone: "South", population: 38700, area: 5.5,  bounds: JSON.stringify({ north: 18.460, south: 18.430, east: 73.870, west: 73.840 }) },
  { code: "W06", name: "Ward 06 – Viman Nagar",      zone: "East",  population: 29600, area: 4.8,  bounds: JSON.stringify({ north: 18.570, south: 18.545, east: 73.930, west: 73.900 }) },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. WORKERS
// ─────────────────────────────────────────────────────────────────────────────
const WORKERS = [
  // COLLECTOR
  { name: "Amit Verma",       email: "amit.verma@wasteflow.in",      phone: "9876543210", role: "COLLECTOR",     ward: "Ward 01 – Shivaji Nagar", wardCode: "W01", hireDate: "2022-03-15", lastActiveAt: hoursAgo(2) },
  { name: "Riya Singh",       email: "riya.singh@wasteflow.in",       phone: "9876543211", role: "COLLECTOR",     ward: "Ward 01 – Shivaji Nagar", wardCode: "W01", hireDate: "2021-07-01", lastActiveAt: hoursAgo(1) },
  { name: "Neha Sharma",      email: "neha.sharma@wasteflow.in",      phone: "9876543212", role: "COLLECTOR",     ward: "Ward 02 – Aundh",         wardCode: "W02", hireDate: "2023-01-10", lastActiveAt: hoursAgo(3) },
  { name: "Vikram Patel",     email: "vikram.patel@wasteflow.in",     phone: "9876543213", role: "COLLECTOR",     ward: "Ward 02 – Aundh",         wardCode: "W02", hireDate: "2020-11-20", lastActiveAt: hoursAgo(4) },
  { name: "Anjali Mehta",     email: "anjali.mehta@wasteflow.in",     phone: "9876543214", role: "COLLECTOR",     ward: "Ward 03 – Kothrud",        wardCode: "W03", hireDate: "2022-06-05", lastActiveAt: hoursAgo(1) },
  { name: "Suresh Yadav",     email: "suresh.yadav@wasteflow.in",     phone: "9876543215", role: "COLLECTOR",     ward: "Ward 03 – Kothrud",        wardCode: "W03", hireDate: "2021-09-15", lastActiveAt: hoursAgo(6) },
  { name: "Priya Joshi",      email: "priya.joshi@wasteflow.in",      phone: "9876543216", role: "COLLECTOR",     ward: "Ward 04 – Hadapsar",       wardCode: "W04", hireDate: "2023-03-01", isAvailable: false, lastActiveAt: hoursAgo(2) },
  { name: "Karan Shah",       email: "karan.shah@wasteflow.in",       phone: "9876543217", role: "COLLECTOR",     ward: "Ward 04 – Hadapsar",       wardCode: "W04", hireDate: "2020-05-20", lastActiveAt: hoursAgo(1) },
  { name: "Deepak Rao",       email: "deepak.rao@wasteflow.in",       phone: "9876543218", role: "COLLECTOR",     ward: "Ward 05 – Katraj",         wardCode: "W05", hireDate: "2022-08-10", lastActiveAt: hoursAgo(3) },
  { name: "Sneha Kulkarni",   email: "sneha.kulkarni@wasteflow.in",   phone: "9876543219", role: "COLLECTOR",     ward: "Ward 05 – Katraj",         wardCode: "W05", hireDate: "2021-12-01", lastActiveAt: hoursAgo(5) },
  { name: "Mohan Desai",      email: "mohan.desai@wasteflow.in",      phone: "9876543220", role: "COLLECTOR",     ward: "Ward 06 – Viman Nagar",    wardCode: "W06", hireDate: "2023-05-15", lastActiveAt: hoursAgo(2) },
  { name: "Lata Patil",       email: "lata.patil@wasteflow.in",       phone: "9876543221", role: "COLLECTOR",     ward: "Ward 06 – Viman Nagar",    wardCode: "W06", hireDate: "2022-02-20", lastActiveAt: hoursAgo(4) },
  // SUPERVISOR
  { name: "Rajesh Nair",      email: "rajesh.nair@wasteflow.in",      phone: "9876543222", role: "SUPERVISOR",    ward: "Ward 01 – Shivaji Nagar", wardCode: "W01", hireDate: "2019-04-01", lastActiveAt: hoursAgo(1) },
  { name: "Sunita Bose",      email: "sunita.bose@wasteflow.in",      phone: "9876543223", role: "SUPERVISOR",    ward: "Ward 02 – Aundh",         wardCode: "W02", hireDate: "2018-08-15", lastActiveAt: hoursAgo(2) },
  { name: "Arvind Kumar",     email: "arvind.kumar@wasteflow.in",     phone: "9876543224", role: "SUPERVISOR",    ward: "Ward 03 – Kothrud",        wardCode: "W03", hireDate: "2019-11-01", lastActiveAt: hoursAgo(3) },
  { name: "Meena Iyer",       email: "meena.iyer@wasteflow.in",       phone: "9876543225", role: "SUPERVISOR",    ward: "Ward 04 – Hadapsar",       wardCode: "W04", hireDate: "2020-01-10", lastActiveAt: hoursAgo(1) },
  { name: "Gopal Thakur",     email: "gopal.thakur@wasteflow.in",     phone: "9876543226", role: "SUPERVISOR",    ward: "Ward 05 – Katraj",         wardCode: "W05", hireDate: "2018-06-15", lastActiveAt: hoursAgo(4) },
  { name: "Kamla Devi",       email: "kamla.devi@wasteflow.in",       phone: "9876543227", role: "SUPERVISOR",    ward: "Ward 06 – Viman Nagar",    wardCode: "W06", hireDate: "2021-03-20", lastActiveAt: hoursAgo(2) },
  // OPERATOR
  { name: "Sanjay Gupta",     email: "sanjay.gupta@wasteflow.in",     phone: "9876543228", role: "OPERATOR",      ward: "Ward 01 – Shivaji Nagar", wardCode: "W01", hireDate: "2022-07-01", lastActiveAt: hoursAgo(1) },
  { name: "Priti More",       email: "priti.more@wasteflow.in",        phone: "9876543229", role: "OPERATOR",      ward: "Ward 02 – Aundh",         wardCode: "W02", hireDate: "2021-10-15", lastActiveAt: hoursAgo(3) },
  { name: "Ramesh Shinde",    email: "ramesh.shinde@wasteflow.in",    phone: "9876543230", role: "OPERATOR",      ward: "Ward 03 – Kothrud",        wardCode: "W03", hireDate: "2023-02-01", lastActiveAt: hoursAgo(2) },
  { name: "Varsha Jadhav",    email: "varsha.jadhav@wasteflow.in",    phone: "9876543231", role: "OPERATOR",      ward: "Ward 04 – Hadapsar",       wardCode: "W04", hireDate: "2020-09-10", lastActiveAt: hoursAgo(5) },
  // ROUTE_PLANNER
  { name: "Nikhil Agarwal",   email: "nikhil.agarwal@wasteflow.in",   phone: "9876543232", role: "ROUTE_PLANNER", wardCode: "W01", ward: "Ward 01 – Shivaji Nagar", hireDate: "2019-06-01", lastActiveAt: hoursAgo(1) },
  { name: "Pooja Mishra",     email: "pooja.mishra@wasteflow.in",     phone: "9876543233", role: "ROUTE_PLANNER", wardCode: "W02", ward: "Ward 02 – Aundh",         hireDate: "2020-03-15", lastActiveAt: hoursAgo(2) },
  // ADMIN
  { name: "Dr. Sandeep Wagh", email: "sandeep.wagh@wasteflow.in",     phone: "9876543234", role: "ADMIN",         hireDate: "2017-01-01", lastActiveAt: hoursAgo(1) },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. VEHICLES
// ─────────────────────────────────────────────────────────────────────────────
const VEHICLES = [
  { registrationNumber: "MH-12-GQ-4920", type: "COMPACTOR",    capacity: 8000, currentLocation: JSON.stringify({ lat: 18.551, lng: 73.855 }), lastFueledAt: daysAgo(2) },
  { registrationNumber: "MH-12-GQ-4921", type: "COMPACTOR",    capacity: 8000, currentLocation: JSON.stringify({ lat: 18.565, lng: 73.808 }), lastFueledAt: daysAgo(1) },
  { registrationNumber: "MH-12-GQ-4922", type: "TIPPER",        capacity: 5000, currentLocation: JSON.stringify({ lat: 18.498, lng: 73.798 }), lastFueledAt: daysAgo(3) },
  { registrationNumber: "MH-12-GQ-4923", type: "TIPPER",        capacity: 5000, currentLocation: JSON.stringify({ lat: 18.480, lng: 73.940 }), lastFueledAt: daysAgo(1) },
  { registrationNumber: "MH-12-GQ-4924", type: "OPEN_BED",      capacity: 3000, currentLocation: JSON.stringify({ lat: 18.445, lng: 73.858 }), lastFueledAt: daysAgo(4) },
  { registrationNumber: "MH-12-GQ-4925", type: "OPEN_BED",      capacity: 3000, currentLocation: JSON.stringify({ lat: 18.558, lng: 73.915 }), lastFueledAt: daysAgo(2) },
  { registrationNumber: "MH-12-GQ-4926", type: "COMPACTOR",    capacity: 10000, status: "MAINTENANCE", currentLocation: JSON.stringify({ lat: 18.530, lng: 73.860 }), lastFueledAt: daysAgo(10) },
  { registrationNumber: "MH-12-GQ-4927", type: "SPECIAL_WASTE", capacity: 2000, currentLocation: JSON.stringify({ lat: 18.549, lng: 73.852 }), lastFueledAt: daysAgo(1) },
  { registrationNumber: "MH-12-GQ-4928", type: "TIPPER",        capacity: 6000, currentLocation: JSON.stringify({ lat: 18.503, lng: 73.925 }), lastFueledAt: daysAgo(2) },
  { registrationNumber: "MH-12-GQ-4929", type: "COMPACTOR",    capacity: 8000, status: "IN_USE", currentLoad: 4200, currentLocation: JSON.stringify({ lat: 18.567, lng: 73.813 }), lastFueledAt: daysAgo(1) },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. CITIZENS
// ─────────────────────────────────────────────────────────────────────────────
const CITIZEN_DATA = [
  ["Aisha Khan",       "aisha.khan@gmail.com",       "9800001001", "W01", "Ward 01 – Shivaji Nagar", "12, MG Road"],
  ["Rohit Kapoor",     "rohit.kapoor@gmail.com",     "9800001002", "W01", "Ward 01 – Shivaji Nagar", "45, Tilak Chowk"],
  ["Meera Nair",       "meera.nair@gmail.com",        "9800001003", "W01", "Ward 01 – Shivaji Nagar", "7, Prabhat Road"],
  ["Arjun Malhotra",   "arjun.malhotra@gmail.com",   "9800001004", "W01", "Ward 01 – Shivaji Nagar", "23, FC Road"],
  ["Divya Saxena",     "divya.saxena@gmail.com",      "9800001005", "W01", "Ward 01 – Shivaji Nagar", "88, Law College Road"],
  ["Farhan Sheikh",    "farhan.sheikh@gmail.com",     "9800001006", "W02", "Ward 02 – Aundh",         "3, ITI Road"],
  ["Kavita Reddy",     "kavita.reddy@gmail.com",      "9800001007", "W02", "Ward 02 – Aundh",         "56, Aundh Road"],
  ["Tarun Bansal",     "tarun.bansal@gmail.com",      "9800001008", "W02", "Ward 02 – Aundh",         "14, DP Road"],
  ["Sunaina Pillai",   "sunaina.pillai@gmail.com",    "9800001009", "W02", "Ward 02 – Aundh",         "29, Bhau Patil Road"],
  ["Harsh Agarwal",    "harsh.agarwal@gmail.com",     "9800001010", "W02", "Ward 02 – Aundh",         "71, Pimpale Nilakh"],
  ["Nisha Bhatt",      "nisha.bhatt@gmail.com",       "9800001011", "W03", "Ward 03 – Kothrud",        "4, Karve Road"],
  ["Siddharth Jain",   "siddharth.jain@gmail.com",    "9800001012", "W03", "Ward 03 – Kothrud",        "18, Paud Road"],
  ["Pooja Tiwari",     "pooja.tiwari@gmail.com",      "9800001013", "W03", "Ward 03 – Kothrud",        "32, Dahanukar Colony"],
  ["Akash Mehta",      "akash.mehta@gmail.com",       "9800001014", "W03", "Ward 03 – Kothrud",        "9, Sinhagad Road"],
  ["Ritu Sharma",      "ritu.sharma@gmail.com",       "9800001015", "W03", "Ward 03 – Kothrud",        "62, Kothrud Depot"],
  ["Imran Ali",        "imran.ali@gmail.com",          "9800001016", "W04", "Ward 04 – Hadapsar",       "5, Solapur Road"],
  ["Priyanka Das",     "priyanka.das@gmail.com",      "9800001017", "W04", "Ward 04 – Hadapsar",       "27, Magarpatta"],
  ["Vikas Rao",        "vikas.rao@gmail.com",         "9800001018", "W04", "Ward 04 – Hadapsar",       "11, Fursungi Road"],
  ["Simran Kaur",      "simran.kaur@gmail.com",       "9800001019", "W04", "Ward 04 – Hadapsar",       "84, Hadapsar Road"],
  ["Ankit Verma",      "ankit.verma@gmail.com",       "9800001020", "W04", "Ward 04 – Hadapsar",       "6, MIDC Road"],
  ["Geeta Deshmukh",   "geeta.deshmukh@gmail.com",   "9800001021", "W05", "Ward 05 – Katraj",         "33, Katraj Road"],
  ["Manoj Kumar",      "manoj.kumar@gmail.com",       "9800001022", "W05", "Ward 05 – Katraj",         "15, Ambegaon"],
  ["Lakshmi Iyer",     "lakshmi.iyer@gmail.com",      "9800001023", "W05", "Ward 05 – Katraj",         "47, Dhayari Road"],
  ["Rahul Pandey",     "rahul.pandey@gmail.com",      "9800001024", "W05", "Ward 05 – Katraj",         "2, Bibwewadi"],
  ["Sneha Patil",      "sneha.patil@gmail.com",       "9800001025", "W05", "Ward 05 – Katraj",         "78, Sahakarnagar"],
  ["Ritesh Mishra",    "ritesh.mishra@gmail.com",     "9800001026", "W06", "Ward 06 – Viman Nagar",    "19, Nagar Road"],
  ["Aditi Ghosh",      "aditi.ghosh@gmail.com",       "9800001027", "W06", "Ward 06 – Viman Nagar",    "42, Vimannagar Road"],
  ["Suraj Negi",       "suraj.negi@gmail.com",        "9800001028", "W06", "Ward 06 – Viman Nagar",    "8, Lohegaon Road"],
  ["Anjali Singh",     "anjali.singh@gmail.com",      "9800001029", "W06", "Ward 06 – Viman Nagar",    "55, Clover Park"],
  ["Rohan Joshi",      "rohan.joshi@gmail.com",       "9800001030", "W06", "Ward 06 – Viman Nagar",    "3, Phoenix Market"],
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
  W01: "Ward 01 – Shivaji Nagar",
  W02: "Ward 02 – Aundh",
  W03: "Ward 03 – Kothrud",
  W04: "Ward 04 – Hadapsar",
  W05: "Ward 05 – Katraj",
  W06: "Ward 06 – Viman Nagar",
};

function makeLocation(wardCode) {
  const bases = { W01:[18.545,73.855], W02:[18.558,73.805], W03:[18.494,73.800], W04:[18.479,73.940], W05:[18.445,73.855], W06:[18.557,73.915] };
  const [lat, lng] = bases[wardCode] ?? [18.52, 73.86];
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
async function seed() {
  try {
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
