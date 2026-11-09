import { expect, test } from "@playwright/test";

for (const [width, height, previewCount] of [[320, 700, 10], [390, 844, 10], [768, 1024, 10], [1024, 768, 10], [1440, 900, 10], [1920, 1080, 10]]) {
  test(`Get Started steps and responsive previews at ${width}x${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    await page.goto("/sign-in");
    const card = page.locator("[data-auth-card]");
    await expect(card).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(card).toHaveCSS("border-top-width", "0px");
    await expect(card).toHaveCSS("box-shadow", "none");
    await expect(card).toHaveCSS("backdrop-filter", "none");
    await expect(card).toHaveCSS("filter", "none");
    await expect(card.getByRole("heading")).toHaveText("Get Started");
    await expect(card.locator("input")).toHaveCount(0);
    await expect(card.locator("button")).toHaveText(["Continue with Google", "Continue with BankID", "Continue with Email & Password"]);
    await expect(page.getByRole("button", { name: "Continue with BankID", exact: true })).toBeDisabled();
    await expect(page.locator("header button, header nav, footer")).toHaveCount(0);
    await expect(page.locator("[data-preview]:visible")).toHaveCount(previewCount);
    const previews = page.locator("[data-auth-orbits]");
    await expect(previews).toHaveCSS("mask-image", "none");
    await expect(previews).toHaveCSS("filter", "none");
    const orbitBox = await previews.evaluate(e=>({width:e.clientWidth,height:e.clientHeight}));
    const original = await previews.elementHandle();
    await page.screenshot({ path: info.outputPath("welcome.png"), fullPage: true });
    await card.getByRole("button", { name: "Continue with Email & Password", exact: true }).click();
    await expect(card.getByRole("heading")).toHaveText("Sign in");
    await expect(card.locator("input")).toHaveCount(2);
    await page.screenshot({ path: info.outputPath("login.png"), fullPage: true });
    const before = await previews.evaluate(e => e.getAnimations({ subtree: true }).filter(a=>a instanceof CSSAnimation).map(a => a.currentTime as number));
    await card.getByRole("button", { name: "Create an account", exact: true }).click();
    await expect(card.locator("input")).toHaveCount(3);
    await expect(card.getByLabel("Customer type (optional)")).not.toHaveAttribute("required", "");
    expect(await previews.evaluate((e, old) => e === old, original)).toBe(true);
    expect(await previews.evaluate(e=>({width:e.clientWidth,height:e.clientHeight}))).toEqual(orbitBox);
    const after = await previews.evaluate(e => e.getAnimations({ subtree: true }).filter(a=>a instanceof CSSAnimation).map(a => a.currentTime as number));
    if (before.length) expect(after.every((time, i) => time >= before[i])).toBe(true);
    await page.screenshot({ path: info.outputPath("register.png"), fullPage: true });
    for (const field of await card.locator("input, select").all()) {
      const box = (await field.boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    await card.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(card.getByRole("heading")).toHaveText("Sign in");
    await expect(card.locator("input")).toHaveCount(2);
    await expect(card.locator("select")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("login.png"), fullPage: true });
    await card.getByRole("button", { name: "Forgot password?", exact: true }).click();
    await expect(card.getByRole("heading")).toHaveText("Reset your password");
    await expect(card.locator("input")).toHaveCount(1);
    await page.screenshot({ path: info.outputPath("recovery.png"), fullPage: true });
    await card.getByRole("button", { name: "Back", exact: true }).click();
    await expect(card.getByRole("heading")).toHaveText("Sign in");
    await card.getByRole("button", { name: "Back", exact: true }).click();
    await expect(card.getByRole("heading")).toHaveText("Get Started");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(errors).toEqual([]);
  });
}

test("both orbits move continuously, keep devices upright and preserve a clear card area", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/sign-in");
  const outer = page.locator('[data-preview="fashion"]'); const inner = page.locator('[data-preview="cafe"]');
  expect(await outer.evaluate(e => getComputedStyle(e).animationDuration)).toBe("67.2s");
  expect(await inner.evaluate(e => getComputedStyle(e).animationDuration)).toBe("86.4s");
  expect(await outer.evaluate(e => getComputedStyle(e).animationName)).toContain("orbit-clockwise");
  expect(await inner.evaluate(e => getComputedStyle(e).animationName)).toContain("orbit-clockwise");
  const start = (await outer.boundingBox())!;
  await outer.evaluate(e => e.getAnimations().find(a=>a instanceof CSSAnimation)!.currentTime = 14000);
  const moved = (await outer.boundingBox())!;
  expect(Math.abs(start.x - moved.x) + Math.abs(start.y - moved.y)).toBeGreaterThan(100);
  await page.getByRole("button", { name: "Continue with Email & Password", exact: true }).click();
  await page.locator("[data-auth-orbits]").evaluate(e => e.getAnimations({ subtree: true }).filter(a=>a instanceof CSSAnimation).forEach(a => { a.pause(); a.currentTime = 0; }));
  const outerOrigin = (await outer.boundingBox())!;
  const innerOrigin = (await inner.boundingBox())!;
  for (const time of [0, 8000, 16000, 24000, 40000, 67200]) {
    await page.locator("[data-auth-orbits]").evaluate((e, time) => e.getAnimations({ subtree: true }).filter(a=>a instanceof CSSAnimation).forEach(a => { a.pause(); a.currentTime = time; }), time);
    for (const button of await page.locator("[data-auth-card] button").all()) {
      if (await button.isDisabled()) continue;
      expect(await button.evaluate(e => { const b=e.getBoundingClientRect(); return e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)); })).toBe(true);
    }
  }
  const outerEnd = (await outer.boundingBox())!;
  expect(outerEnd.x).toBeCloseTo(outerOrigin.x, 0); expect(outerEnd.y).toBeCloseTo(outerOrigin.y, 0);
  await inner.evaluate(e => e.getAnimations().find(a=>a instanceof CSSAnimation)!.currentTime = 86400);
  const innerEnd = (await inner.boundingBox())!;
  expect(innerEnd.x).toBeCloseTo(innerOrigin.x, 0); expect(innerEnd.y).toBeCloseTo(innerOrigin.y, 0);
});

test("reduced motion and short mobile viewport keep forms accessible without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 420 }); await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sign-in");
  await expect.poll(()=>page.locator("[data-auth-orbits]").evaluate(e => e.getAnimations({ subtree: true }).length)).toBe(0);
  await page.getByRole("button", { name: "Continue with Email & Password", exact: true }).click();
  await page.getByLabel("Password", { exact: true }).fill("A-long-example-password");
  const button=page.getByRole("button", { name: "Sign in", exact: true }); await button.scrollIntoViewIfNeeded();
  await expect(button).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

for (const width of [390, 1440]) {
  test(`orbit previews stay visible around the auth controls at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto("/sign-in");
    const area=page.locator("[data-auth-card]");
    const orbits=page.locator("[data-auth-orbits]");
    for (const mode of ["welcome","login","recovery"]) {
      if(mode==="login") await area.getByRole("button",{name:"Continue with Email & Password",exact:true}).click();
      if(mode==="recovery") await area.getByRole("button",{name:"Forgot password?",exact:true}).click();
      for(const time of [0,16800,33600,50400]) {
        await orbits.evaluate((e,time)=>e.getAnimations({subtree:true}).filter(a=>a instanceof CSSAnimation).forEach(a=>{a.pause();a.currentTime=time;}),time);
        await expect.poll(()=>orbits.evaluate(e=>[...e.querySelectorAll<HTMLElement>("[data-preview]")]
          .filter(device=>getComputedStyle(device).display!=="none")
          .every(device=>getComputedStyle(device).opacity === "1"))).toBe(true);
        await expect(area).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
      }
      for(const control of await area.locator("button:not(:disabled),input").all()) {
        await control.scrollIntoViewIfNeeded();
        expect(await control.evaluate(e=>{const b=e.getBoundingClientRect();return e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));})).toBe(true);
      }
    }
  });
}

test("unavailable registration and recovery never fabricate success or send credentials", async ({ page }) => {
  const calls: string[]=[]; page.on("request", r => {if(r.method()==="POST") calls.push(r.url());});
  await page.goto("/sign-in"); await page.getByRole("button", { name: "Continue with Email & Password", exact: true }).click();
  await page.getByRole("button", { name: "Create an account", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill("Test visitor");
  await page.getByLabel("Email", { exact: true }).fill("visitor@example.invalid");
  await page.getByLabel("Password", { exact: true }).fill("A-long-example-password");
  await page.getByRole("button", { name: "Get Started", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("not available yet");
  await page.getByRole("button", { name: "Forgot password?", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill("visitor@example.invalid");
  await page.getByRole("button", { name: "Send reset request", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("not available yet");
  expect(calls).toEqual([]);
});
