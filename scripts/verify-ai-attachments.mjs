import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Explicit opt-in: this verifies real, paid API analysis with synthetic public fixtures only.
if (!process.argv.includes("--live")) throw new Error("Pass --live only after the approved deployment is ready.");
const base = "https://bluemind-web-service.vercel.app";
const output = path.resolve("test-results/ai-live-attachments");
await mkdir(output, { recursive: true });
const fixture = name => path.resolve("tests/ai-public/fixtures", name);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const results = [];
let lastRequest = 0;
async function send(text, expected, number = 1) {
  await new Promise(resolve => setTimeout(resolve, Math.max(0, 17000 - (Date.now() - lastRequest))));
  await page.getByRole("textbox", { name: "Message", exact: true }).fill(text);
  const network = page.waitForResponse(response => response.url() === `${base}/api/ai/chat`, { timeout: 70000 });
  lastRequest = Date.now();
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const response = await network;
  if (response.status() !== 200) throw new Error(`AI request returned HTTP ${response.status()}`);
  const wire = await response.text();
  if (!wire.includes('"type":"done"') || wire.includes('"type":"error"')) throw new Error("AI stream did not complete successfully");
  const reveal = page.getByRole("button", { name: "Show instantly", exact: true });
  if (await reveal.isVisible()) await reveal.click();
  await expect(page.getByRole("button", { name: "Stop response", exact: true })).toHaveCount(0, { timeout: 70000 });
  const answer = await page.getByLabel("BlueMind AI response", { exact: true }).nth(number - 1).innerText();
  if (!expected.test(answer)) throw new Error(`Real analysis did not match the synthetic fixture: ${answer.slice(0, 500)}`);
  results.push({ check: text || "image-only message", status: response.status(), answer });
  console.log(JSON.stringify({ check: results.at(-1).check, status: 200, verified: true, excerpt: answer.slice(0, 250) }));
}
async function fresh() {
  await page.getByRole("button", { name: "New chat", exact: true }).filter({ visible: true }).click();
}
async function attach(names, images = false) {
  await page.getByLabel(images ? "Upload images" : "Upload documents", { exact: true }).setInputFiles(names.map(fixture));
  await expect(page.getByLabel("Selected attachments")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeEnabled();
}
try {
  await page.goto(`${base}/ask-ai`);
  await attach(["sample.png"], true);
  await send("", /red/i);
  await send("Is the attached image portrait or landscape? Answer briefly.", /portrait|taller/i, 2);
  await fresh(); await attach(["sample.png", "sample.jpg"], true);
  await send("Compare the dominant color and orientation of each attached image. Be brief.", /red[\s\S]*blue|blue[\s\S]*red/i);
  await page.getByRole("button", { name: "Open image sample.png", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.screenshot({ path: path.join(output, "live-viewer.png") });
  await page.keyboard.press("Escape");
  await fresh(); await attach(["sample.webp"], true);
  await send("What is the dominant color in this image? Answer briefly.", /green/i);

  const design = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await design.setContent('<!doctype html><html><body style="margin:0;font-family:Arial;color:#142d4e;background:#fff"><header style="padding:24px;border-bottom:1px solid #ddd">HARBOR STUDIO <span style="float:right">Services &nbsp; Contact</span></header><main style="padding:70px 50px"><h1 style="font-size:48px">Websites for local businesses</h1><p style="font-size:20px">A clear, accessible website starts here.</p><button style="background:#142d4e;color:white;padding:16px 24px;border:0">Request a quote</button><p style="color:#ccc;font-size:10px">Preview code: HARBOR-719</p></main></body></html>');
  const screenshot = path.join(output, "synthetic-website.png");
  await design.screenshot({ path: screenshot }); await design.close();
  await fresh();
  await page.getByLabel("Upload images", { exact: true }).setInputFiles(screenshot);
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeEnabled();
  await send("Read the studio name and preview code visible in this website screenshot, then suggest two UI improvements. Be brief.", /HARBOR-719/i);

  const documents = [
    ["brief.pdf", "What time does the cafe open according to this PDF? Include its project code. Be brief.", /09:30[\s\S]*LIME-482|LIME-482[\s\S]*09:30/],
    ["brief.docx", "According to the attached document, which pages should be included? Give its launch code too. Be brief.", /LIME-482/],
    ["notes.txt", "What launch code and opening time are in this text file? Be brief.", /LIME-482/],
    ["budget.xlsx", "What is the sheet name, item, and count in this spreadsheet? Be brief.", /7/],
  ];
  for (const [name, prompt, expected] of documents) { await fresh(); await attach([name]); await send(prompt, expected); }
  await send("What was that spreadsheet item called?", /Landing pages/i, 2);
  await page.screenshot({ path: path.join(output, "live-document-analysis.png") });
  expect(errors).toEqual([]);
  await writeFile(path.join(output, "results.json"), JSON.stringify({ results, pageErrors: errors }, null, 2));
  console.log(`Verified ${results.length} real production responses through the website.`);
} finally { await browser.close(); }
