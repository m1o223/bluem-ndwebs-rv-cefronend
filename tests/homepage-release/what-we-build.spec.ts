import { expect, test } from "@playwright/test";

for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
  test(`Folio Books devices and content fit ${width}x${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[]=[]; page.on("pageerror", error=>errors.push(error.message));
    await page.goto("/");
    const section=page.locator("[data-build-section]");
    await expect(section.getByRole("heading")).toHaveText("What We Build");
    await expect(section.locator("li")).toHaveCount(15);
    await expect.poll(()=>section.locator("img").evaluateAll(images=>images.every(image=>(image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth>0))).toBe(true);
    const stage=(await section.locator("[data-build-stage]").boundingBox())!;
    const devices=await section.locator("[data-build-device]").all();
    let right=stage.x;
    for(const device of devices) {
      await expect(device).toHaveCSS("opacity", "1");
      const box=(await device.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(right); expect(box.x+box.width).toBeLessThanOrEqual(stage.x+stage.width);
      expect(box.y).toBeGreaterThanOrEqual(stage.y); expect(box.y+box.height).toBeLessThanOrEqual(stage.y+stage.height);
      right=box.x+box.width;
      const image=device.locator("img");
      expect(await image.evaluate(e=>{const i=e as HTMLImageElement;return Math.abs(i.width/i.height-i.naturalWidth/i.naturalHeight);})).toBeLessThan(.015);
    }
    const tablet=(await devices[1].boundingBox())!;
    expect(tablet.x+tablet.width/2).toBeCloseTo(stage.x+stage.width/2,0);
    const description=(await section.locator("[data-build-description]").boundingBox())!;
    expect(description.y).toBeGreaterThanOrEqual(stage.y+stage.height);
    expect(await section.evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    await section.screenshot({path:info.outputPath("what-we-build.png")});
    expect(errors).toEqual([]);
  });
}

for (const [width, entrance, phoneDelay, desktopDelay, settled] of [[1440,650,900,1020,1670],[390,450,700,820,1270]]) {
test(`scroll trigger coordinates entrances, one-time zoom and text without replay at ${width}px`, async ({ page }) => {
  await page.setViewportSize({width,height:500});
  await page.addInitScript(()=>localStorage.setItem("bluemind:brand-intro:v1","complete"));
  await page.goto("/");
  const section=page.locator("[data-build-section]");
  await expect(section).toHaveAttribute("data-started","false");
  await section.locator("[data-build-stage]").scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-started","true");
  const times=await section.evaluate(e=>[...e.querySelectorAll("[data-build-device]")].map(el=>{const a=el.getAnimations()[0];return {device:el.getAttribute("data-build-device"),delay:a.effect!.getTiming().delay,duration:a.effect!.getTiming().duration};}));
  expect(times).toEqual([{device:"desktop",delay:desktopDelay,duration:entrance},{device:"tablet",delay:0,duration:entrance},{device:"phone",delay:phoneDelay,duration:entrance}]);
  const freeze=async(time:number)=>section.evaluate((e,time)=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=time;}),time);
  await freeze(entrance);
  await expect(section.locator('[data-build-device="tablet"]')).toHaveCSS("opacity","1");
  await expect(section.locator('[data-build-device="phone"]')).toHaveCSS("opacity","0");
  await expect(section.locator('[data-build-device="desktop"]')).toHaveCSS("opacity","0");
  await expect(section.locator("[data-build-description]")).toHaveCSS("opacity","0");
  await freeze(settled);
  for(const device of await section.locator("[data-build-device]").all()) await expect(device).toHaveCSS("opacity","1");
  const group=section.locator("[data-build-group]");
  await freeze(settled+1000);
  expect(await group.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a)).toBeCloseTo(1.04,3);
  const stage=(await section.locator("[data-build-stage]").boundingBox())!;
  for(const device of await section.locator("[data-build-device]").all()) {
    const box=(await device.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(stage.x);expect(box.x+box.width).toBeLessThanOrEqual(stage.x+stage.width);
    expect(box.y).toBeGreaterThanOrEqual(stage.y);expect(box.y+box.height).toBeLessThanOrEqual(stage.y+stage.height);
  }
  await freeze(settled+2000);
  expect(await group.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a)).toBeCloseTo(1,3);
  const card=await group.elementHandle();
  await page.evaluate(()=>scrollTo(0,0));
  await section.locator("[data-build-stage]").scrollIntoViewIfNeeded();
  expect(await group.evaluate((e,old)=>e===old,card)).toBe(true);
  expect(await group.evaluate(e=>e.getAnimations()[0].currentTime)).toBe(settled+2000);
});
}

test("device sequence waits for the original intro to finish",async({page})=>{
  await page.setViewportSize({width:1440,height:1080});await page.goto("/");
  const section=page.locator("[data-build-section]");
  await expect(page.locator("#bluemind-brand-intro")).toBeVisible();
  await expect.poll(()=>section.locator("img").evaluateAll(images=>images.every(image=>(image as HTMLImageElement).complete))).toBe(true);
  await expect(section).toHaveAttribute("data-started","false");
  await page.getByRole("button",{name:"Skip Intro",exact:true}).click();
  await expect(section).toHaveAttribute("data-started","true");
});

for(const [locale,title,description,cta] of [["ar","شو منبني؟","مواقع مصمّمة حسب احتياجات شغلك.","احكيلنا عن فكرتك"],["sv","Vad vi bygger","Webbplatser byggda efter ditt företags behov.","Berätta om din idé"]]) {
  test(`localized content and idea destination in ${locale}`,async({page})=>{
    await page.setViewportSize({width:390,height:844}); await page.emulateMedia({reducedMotion:"reduce"});
    await page.addInitScript(locale=>localStorage.setItem("bluemind-language",locale),locale);
    await page.goto("/"); const section=page.locator("[data-build-section]");
    await expect(section).toHaveAttribute("dir",locale==="ar"?"rtl":"ltr");
    await expect(section.getByRole("heading")).toHaveText(title);
    await expect(section.locator("[data-build-description]")).toHaveText(description);
    await expect(section.locator("li")).toHaveCount(15);
    await expect(section.getByRole("link",{name:cta,exact:true})).toHaveAttribute("href","/quote");
    await section.getByRole("link",{name:cta,exact:true}).click(); await expect(page).toHaveURL(/\/quote$/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  });
}
