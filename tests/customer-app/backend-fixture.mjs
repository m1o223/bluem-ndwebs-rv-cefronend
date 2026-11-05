import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import path from "node:path";
const root = process.env.CUSTOMER_BACKEND_REPO;
if (!root) throw new Error("Set CUSTOMER_BACKEND_REPO to the web-service backend checkout.");
const { createCustomerRoute } = await import(pathToFileURL(path.join(root, "src/customerAuth.js")));
const { memoryDatabase } = await import(pathToFileURL(path.join(root, "test/fixtures/customer-memory.mjs")));
const { default: bcrypt } = await import(pathToFileURL(path.join(root, "node_modules/bcryptjs/index.js")));
const { OAuth2Client } = await import(pathToFileURL(path.join(root, "node_modules/google-auth-library/build/src/index.js")));
const db = memoryDatabase();
const passwordHash = await bcrypt.hash("Isolated-browser-test-123!", 12);
for (let i = 0; i < 12; i++) await db.collection("customerAccounts").insertOne({ _id: "test-" + i, displayName: "UI test", email: `customer-${i}@example.invalid`, passwordHash, enabled: true });
await db.collection("customerProjects").insertOne({ _id: "fixture-project", customerId: "test-8", current: true, name: "Isolated fixture project", description: "Only used by automated tests.", orderNumber: "TEST-8", type: "Website", currency: "SEK", totalMinor: 10000, paidMinor: 2500, remainingMinor: 7500, steps: { idea: "completed", review: "completed", direction: "in_progress", development: "not_started", testing: "not_started", finalReview: "not_started", delivery: "not_started" }, updatedAt: new Date(), timeline: [{ text: "Fixture review completed", date: new Date() }] });
await db.collection("customerNotifications").insertOne({ _id: "fixture-notice", customerId: "test-8", text: "Fixture project updated", createdAt: new Date() });
// Isolated test double: never contacts Google or production MongoDB.
const googleClientFactory = options => {
  const client = new OAuth2Client(options);
  client.getToken = async ({ code }) => ({ tokens: { id_token: code } });
  client.verifyIdToken = async ({ idToken }) => {
    if (idToken === "failed-provider") throw new Error("Test provider failure");
    return { getPayload: () => ({ iss: "https://accounts.google.com", aud: "browser-test-client", sub: "browser-test-google-subject", email: "google-browser@example.invalid", email_verified: true, name: "Google test customer", nonce: idToken }) };
  };
  return client;
};
const route = createCustomerRoute({ NODE_ENV: "production", GOOGLE_AUTH_ENABLED: "true", GOOGLE_CLIENT_ID: "browser-test-client", GOOGLE_CLIENT_SECRET: "test-only", GOOGLE_REDIRECT_URI: "https://bluemindwebservice.com/api/auth/callback/google" }, { database: async () => db, notify: async () => ({ sent: true }), googleClientFactory });
createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/health") { res.end("test-only"); return; }
  return route(req, res, pathname);
}).listen(4209, "127.0.0.1");
