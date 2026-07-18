import { Databases, ID, Permission, Role, DatabasesIndexType } from "node-appwrite";
import { client } from "./client.js";

const databases = new Databases(client);
const DATABASE_ID = '6a540f2e001dfabaccb5';
const COLLECTION_ID = 'scrapListings';
const COLLECTION_NAME = 'Scrap Listings';

const str  = (dbId, col, key, size = 255, required = true, def = undefined) =>
  databases.createStringAttribute(dbId, col, key, size, required, def);

const int  = (dbId, col, key, required = true, min = undefined, max = undefined, def = undefined) =>
  databases.createIntegerAttribute(dbId, col, key, required, min, max, def);

const flt  = (dbId, col, key, required = false, min = undefined, max = undefined, def = undefined) =>
  databases.createFloatAttribute(dbId, col, key, required, min, max, def);

const dt   = (dbId, col, key, required = true) =>
  databases.createDatetimeAttribute(dbId, col, key, required);

const enm  = (dbId, col, key, values, required = true, def = undefined) =>
  databases.createEnumAttribute(dbId, col, key, values, required, def);

const idx  = (dbId, col, key, attrs, type = DatabasesIndexType.Key) =>
  databases.createIndex(dbId, col, key, type, attrs);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForAttributes(dbId, colId, attributeKeys) {
  console.log("⏳ Waiting for all attributes to become available on Appwrite...");
  for (let i = 0; i < 30; i++) { // Max 45 seconds wait
    const col = await databases.getCollection(dbId, colId);
    const pending = col.attributes.filter(a => attributeKeys.includes(a.key) && a.status !== 'available');
    if (pending.length === 0) {
      console.log("✅ All attributes are available.");
      return;
    }
    console.log(`   Pending attributes: ${pending.map(a => `${a.key} (${a.status})`).join(', ')}`);
    await sleep(2000);
  }
  throw new Error("Timeout waiting for attributes to propagate.");
}

async function setup() {
  try {
    console.log(`🚀 Setting up Scrap Listings collection under database: ${DATABASE_ID}...`);

    // Check if collection exists and delete it to start fresh
    try {
      await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      console.log(`🗑  Deleting existing collection: ${COLLECTION_ID}`);
      await databases.deleteCollection(DATABASE_ID, COLLECTION_ID);
      await sleep(3000); // Wait for deletion to propagate
    } catch (e) {
      // Collection does not exist
    }

    console.log(`Creating collection: ${COLLECTION_NAME}...`);
    await databases.createCollection(DATABASE_ID, COLLECTION_ID, COLLECTION_NAME, [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.team("admins")),
      Permission.delete(Role.team("admins")),
    ]);

    await str(DATABASE_ID, COLLECTION_ID, "citizenId", 36);
    await enm(DATABASE_ID, COLLECTION_ID, "category", ["PAPER", "PLASTIC", "METAL", "E_WASTE", "CARDBOARD"]);
    await flt(DATABASE_ID, COLLECTION_ID, "estimatedWeight", true, 0);
    await str(DATABASE_ID, COLLECTION_ID, "address", 500);
    await enm(DATABASE_ID, COLLECTION_ID, "status", ["PENDING", "ASSIGNED", "COLLECTED", "CANCELLED"]);
    await str(DATABASE_ID, COLLECTION_ID, "imageUrl", 500, false);
    await str(DATABASE_ID, COLLECTION_ID, "dealerId", 36, false);
    await str(DATABASE_ID, COLLECTION_ID, "dealerName", 150, false);
    await int(DATABASE_ID, COLLECTION_ID, "rewardPoints", false, 0, undefined, 0);
    await dt (DATABASE_ID, COLLECTION_ID, "createdAt");
    await dt (DATABASE_ID, COLLECTION_ID, "updatedAt");
    await dt (DATABASE_ID, COLLECTION_ID, "collectedAt", false);

    const attrKeys = [
      "citizenId", "category", "estimatedWeight", "address", "status",
      "imageUrl", "dealerId", "dealerName", "rewardPoints", "createdAt",
      "updatedAt", "collectedAt"
    ];
    await waitForAttributes(DATABASE_ID, COLLECTION_ID, attrKeys);

    console.log("Creating indexes...");
    await idx(DATABASE_ID, COLLECTION_ID, "idx_citizenId", ["citizenId"]);
    await idx(DATABASE_ID, COLLECTION_ID, "idx_status", ["status"]);
    await idx(DATABASE_ID, COLLECTION_ID, "idx_category", ["category"]);
    await idx(DATABASE_ID, COLLECTION_ID, "idx_createdAt", ["createdAt"]);

    console.log("🎉 Scrap Listings Collection Provisioned Successfully!");
  } catch (err) {
    console.error("❌ Setup failed:", err.message ?? err);
    process.exit(1);
  }
}

setup();
