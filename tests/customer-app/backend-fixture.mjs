import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import path from "node:path";
const root = process.env.CUSTOMER_BACKEND_REPO;
if (!root) throw new Error("Set CUSTOMER_BACKEND_REPO to the web-service backend checkout.");
const { createCustomerRoute } = await import(pathToFileURL(path.join(root, "src/customerAuth.js")));
const { memoryDatabase } = await import(pathToFileURL(path.join(root, "test/fixtures/customer-memory.mjs")));
const { default: bcrypt } = await import(pathToFileURL(path.join(root, "node_modules/bcryptjs/index.js")));
const db = memoryDatabase();
const passwordHash = await bcrypt.hash("Isolated-browser-test-123!", 12);
for (let i = 0; i < 12; i++) await db.collection("customerAccounts").insertOne({ _id: "test-" + i, displayName: "UI test", email: `customer-${i}@example.invalid`, passwordHash, enabled: true });
await db.collection("customerProjects").insertOne({ _id: "fixture-project", customerId: "test-8", current: true, name: "Isolated fixture project", description: "Only used by automated tests.", orderNumber: "TEST-8", type: "Website", currency: "SEK", totalMinor: 10000, paidMinor: 2500, remainingMinor: 7500, steps: { idea: "completed", review: "completed", direction: "in_progress", development: "not_started", testing: "not_started", finalReview: "not_started", delivery: "not_started" }, updatedAt: new Date(), timeline: [{ text: "Fixture review completed", date: new Date() }] });
await db.collection("customerNotifications").insertOne({ _id: "fixture-notice", customerId: "test-8", text: "Fixture project updated", createdAt: new Date() });
const route = createCustomerRoute({ NODE_ENV: "production" }, { database: async () => db, notify: async () => ({ sent: true }) });
createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/health") { res.end("test-only"); return; }
  return route(req, res, pathname);
}).listen(4209, "127.0.0.1");
