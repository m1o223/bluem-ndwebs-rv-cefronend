"use client";

import Image from "next/image";
import { ArrowRight, Check, ChevronDown, Menu, Plus, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useLocalization } from "../localization-provider";
import {
  demoCategories,
  getDemoCategory,
  type DemoAction,
  type DemoCategoryId,
} from "./category-demo-data";
import styles from "./category-demo.module.css";

type DeviceMode = "phone" | "ipad" | "desktop";
type DemoStep = "browse" | "select" | "checkout" | "done";

const deviceSizes: Record<DeviceMode, { label: string; width: number; height: number }> = {
  phone: { label: "Phone", width: 390, height: 844 },
  ipad: { label: "iPad", width: 768, height: 1024 },
  desktop: { label: "Desktop", width: 1280, height: 820 },
};

function getInitialDevice(): DeviceMode {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 600px)").matches) return "phone";
  if (window.matchMedia("(max-width: 1024px)").matches) return "ipad";
  return "desktop";
}

const cartItems: Record<string, { name: string; detail: string; price: number }[]> = {
  restaurant: [
    { name: "Tagliatelle al limone", detail: "lemon, pecorino, basil", price: 185 },
    { name: "Sera house salad", detail: "fennel, orange, olive", price: 125 },
    { name: "Tiramisu", detail: "espresso, mascarpone, cocoa", price: 95 },
  ],
  cafe: [
    { name: "Oat milk flat white", detail: "double espresso, silky oat milk", price: 52 },
    { name: "Cardamom bun", detail: "brown butter, pearl sugar", price: 42 },
    { name: "Daylight lunch bowl", detail: "greens, grains, seasonal vegetables", price: 119 },
  ],
  store: [
    { name: "Blue Hour notebook", detail: "linen cover, 160 pages", price: 240 },
    { name: "Daily objects set", detail: "three pieces, made to last", price: 680 },
    { name: "Field tote", detail: "organic canvas, navy", price: 390 },
  ],
};

const bookingServices: Record<string, { name: string; detail: string; price: number }[]> = {
  salon: [
    { name: "Signature cut", detail: "consultation, cut and finish · 60 min", price: 780 },
    { name: "Skin reset", detail: "cleanse, treatment and calm · 50 min", price: 690 },
    { name: "Studio colour", detail: "tailored colour consultation · 90 min", price: 1200 },
  ],
  appointment: [
    { name: "Brand clarity session", detail: "with Lina · 45 min", price: 0 },
    { name: "Project planning call", detail: "with the studio · 60 min", price: 0 },
    { name: "Portfolio review", detail: "with a senior mentor · 30 min", price: 0 },
  ],
  clinic: [
    { name: "First consultation", detail: "with a specialist · 45 min", price: 0 },
    { name: "Wellbeing review", detail: "a calm, focused check-in · 30 min", price: 0 },
    { name: "Follow-up appointment", detail: "continue your care plan · 30 min", price: 0 },
  ],
  fitness: [
    { name: "Strength foundations", detail: "Tuesday · 18:00 · 12 places", price: 0 },
    { name: "Slow flow", detail: "Wednesday · 07:30 · 16 places", price: 0 },
    { name: "Saturday circuit", detail: "Saturday · 10:00 · 20 places", price: 0 },
  ],
};

const hotelRooms = [
  { name: "The garden room", detail: "king bed · breakfast included", price: 1950 },
  { name: "The north suite", detail: "lake view · breakfast included", price: 2750 },
  { name: "The slow cabin", detail: "private sauna · breakfast included", price: 3200 },
];

const categoryLabels: Record<DemoCategoryId, string> = Object.fromEntries(
  demoCategories.map((category) => [category.id, category.label.en]),
) as Record<DemoCategoryId, string>;

function money(value: number) {
  return `${value.toLocaleString("en-US")} SEK`;
}

function flowItems(category: DemoCategoryId) {
  if (category === "hotel") return hotelRooms;
  return cartItems[category] || bookingServices[category] || [];
}

function actionDescription(action: DemoAction) {
  switch (action) {
    case "cart": return "Add an item, review the basket, and complete a safe demo checkout.";
    case "booking": return "Choose a service and time, then see the confirmation a real customer would receive.";
    case "quote": return "Tell the team what you need and finish with a clear request confirmation.";
    case "viewing": return "Choose a property and request a private viewing in a few steps.";
    case "waitlist": return "Leave your details for the launch list and receive a demo confirmation.";
    case "tickets": return "Choose tickets, add your details, and finish with a simulated ticket confirmation.";
    case "donation": return "Choose an amount and see how a focused giving journey can work.";
    case "ai": return "Describe an idea and get a useful project structure inside this guided demo.";
  }
}

export default function CategoryDemoViewer({
  category: categoryId,
  onClose,
}: {
  category: DemoCategoryId;
  onClose: () => void;
}) {
  const category = getDemoCategory(categoryId);
  const { locale } = useLocalization();
  const closeButton = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [scale, setScale] = useState(1);
  const [step, setStep] = useState<DemoStep>("browse");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedItem, setSelectedItem] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, 420);
  }, [onClose]);

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      opener.current?.focus({ preventScroll: true });
    };
  }, [handleClose]);

  useLayoutEffect(() => {
    setDevice(getInitialDevice());
  }, []);

  useLayoutEffect(() => {
    const host = stage.current;
    if (!host) return;
    const fit = () => {
      const size = deviceSizes[device];
      const availableWidth = Math.max(280, host.clientWidth - 28);
      const availableHeight = Math.max(320, host.clientHeight - 28);
      setScale(Math.min(1, availableWidth / size.width, availableHeight / size.height));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(host);
    window.addEventListener("resize", fit);
    return () => { observer.disconnect(); window.removeEventListener("resize", fit); };
  }, [device]);

  const size = deviceSizes[device];
  const frameStyle = { width: size.width, height: size.height, transform: `scale(${scale})` };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="demo-viewer-title" data-demo-phase={closing ? "closing" : "open"}>
      <div className={`${styles.viewer} ${closing ? styles.viewerClosing : ""}`}>
        <header className={styles.viewerHeader}>
          <div className={styles.viewerIdentity}>
            <span className={styles.viewerKicker}>Demo website</span>
            <h2 id="demo-viewer-title">{category.brand} <span>· {categoryLabels[category.id]}</span></h2>
          </div>
          <div className={styles.viewerActions}>
            <div className={styles.deviceControls} role="group" aria-label="Demo viewport">
              {(Object.keys(deviceSizes) as DeviceMode[]).map((mode) => (
                <button key={mode} type="button" aria-pressed={device === mode} onClick={() => setDevice(mode)}>
                  {deviceSizes[mode].label}
                </button>
              ))}
            </div>
            <button ref={closeButton} type="button" className={styles.closeButton} onClick={handleClose} aria-label="Close demo">
              Close <X size={17} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div ref={stage} className={styles.stage}>
          <div className={styles.frameWrap} style={{ width: size.width * scale, height: size.height * scale }}>
            <div className={styles.logicalFrame} data-demo-viewport data-demo-device={device} style={frameStyle}>
              <DemoSite
                category={category}
                locale={locale}
                step={step}
                setStep={setStep}
                cart={cart}
                setCart={setCart}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                formMessage={formMessage}
                setFormMessage={setFormMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoSite({
  category,
  locale,
  step,
  setStep,
  cart,
  setCart,
  selectedItem,
  setSelectedItem,
  menuOpen,
  setMenuOpen,
  formMessage,
  setFormMessage,
}: {
  category: ReturnType<typeof getDemoCategory>;
  locale: string;
  step: DemoStep;
  setStep: (step: DemoStep) => void;
  cart: Record<string, number>;
  setCart: (cart: Record<string, number>) => void;
  selectedItem: number;
  setSelectedItem: (index: number) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  formMessage: string;
  setFormMessage: (message: string) => void;
}) {
  const site = useRef<HTMLDivElement>(null);
  const items = flowItems(category.id);
  const isCart = category.action === "cart";
  const isBooking = category.action === "booking";
  const total = items.reduce((sum, item) => sum + item.price * (cart[item.name] || 0), 0);
  const displayLabel = category.label[locale as "en" | "ar" | "sv"] || category.label.en;

  function jump(id: string) {
    site.current?.querySelector<HTMLElement>(`[data-demo-section="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  function startAction() {
    setStep("select");
    setFormMessage("");
    requestAnimationFrame(() => site.current?.querySelector<HTMLElement>("[data-demo-flow]")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function addItem(name: string) {
    setCart({ ...cart, [name]: (cart[name] || 0) + 1 });
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("done");
    setFormMessage("Your demo request is confirmed. No real order, booking, payment, or message was sent.");
  }

  return (
    <div ref={site} className={styles.site} style={{ "--accent": category.accent, "--ink": category.ink, "--surface": category.surface } as CSSProperties} data-demo-site data-demo-category={category.id}>
      <div className={styles.siteScroll}>
        <header className={styles.siteHeader}>
          <button type="button" className={styles.wordmark} onClick={() => jump("home")}><strong>{category.brand}</strong><small>{displayLabel}</small></button>
          <nav className={`${styles.siteNav} ${menuOpen ? styles.siteNavOpen : ""}`} aria-label={`${category.brand} navigation`}>
            {category.nav.map((link, index) => <button key={link} type="button" onClick={() => jump(index === 0 ? "discover" : index === 1 ? "story" : "action")}>{link}</button>)}
            <button type="button" onClick={startAction}>{category.actionLabel}</button>
          </nav>
          <button type="button" className={styles.menuToggle} aria-expanded={menuOpen} aria-label={`${menuOpen ? "Close" : "Open"} menu`} onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
        </header>
        <main>
          <section className={styles.siteHero} data-demo-section="home">
            <div className={styles.heroCopy}>
              <span className={styles.siteEyebrow}>{category.eyebrow}</span>
              <h1>{category.title}</h1>
              <p>{category.description}</p>
              <div className={styles.heroButtons}>
                <button type="button" className={styles.primaryButton} onClick={startAction}>{category.actionLabel}<ArrowRight size={16} /></button>
                <button type="button" className={styles.secondaryButton} onClick={() => jump("discover")}>{category.secondaryLabel || "Explore"}</button>
              </div>
              <small className={styles.demoDisclosure}>Interactive concept · no real transaction</small>
            </div>
            <div className={styles.heroImage}>
              <Image src={category.image} alt="" fill sizes="(max-width: 700px) 90vw, 54vw" priority />
              <span>{category.brand}</span>
            </div>
          </section>
          <section className={styles.infoSection} data-demo-section="discover">
            <div><span className={styles.siteEyebrow}>A considered experience</span><h2>Everything your customer needs, in the right order.</h2></div>
            <div className={styles.infoGrid}>
              <article><span>01</span><h3>Clear first step</h3><p>The main action is easy to find from the first screen, whether a visitor wants a table, a room, a quote or a ticket.</p></article>
              <article><span>02</span><h3>Details that build trust</h3><p>Useful information appears beside the decision: prices, availability, timings, options and a plain-language confirmation.</p></article>
              <article><span>03</span><h3>Ready for every screen</h3><p>Switch the preview above to see the same concept respond naturally to phone, iPad and desktop widths.</p></article>
            </div>
          </section>
          <section className={styles.storySection} data-demo-section="story">
            <div className={styles.storyPanel}><span className={styles.siteEyebrow}>Built around the business</span><h2>{category.brand} keeps the useful things close.</h2><p>From browsing to the final confirmation, the experience is shaped around what this business needs its customers to do next.</p><button type="button" className={styles.textButton} onClick={startAction}>{category.actionLabel} <ArrowRight size={15} /></button></div>
            <div className={styles.storyList}><div><strong>Simple</strong><span>less friction, more confidence</span></div><div><strong>Specific</strong><span>content with a reason to be there</span></div><div><strong>Human</strong><span>space for questions and choice</span></div></div>
          </section>
          <section className={styles.flowSection} data-demo-flow data-demo-section="action" aria-live="polite">
            {step === "browse" ? <div className={styles.flowIntro}><span className={styles.siteEyebrow}>Try the main journey</span><h2>See how {displayLabel.toLowerCase()} could work from start to finish.</h2><p>{actionDescription(category.action)}</p><button type="button" className={styles.primaryButton} onClick={startAction}>{category.actionLabel}<ArrowRight size={16} /></button></div> : <DemoFlow category={category} step={step} setStep={setStep} items={items} cart={cart} setCart={setCart} selectedItem={selectedItem} setSelectedItem={setSelectedItem} total={total} formMessage={formMessage} submitForm={submitForm} />}
          </section>
        </main>
        <footer className={styles.siteFooter}><strong>{category.brand}</strong><span>Fictional BlueMind concept · all actions are simulated</span><button type="button" onClick={() => jump("home")}>Back to top <ChevronDown size={14} /></button></footer>
      </div>
    </div>
  );
}

function DemoFlow({
  category,
  step,
  setStep,
  items,
  cart,
  setCart,
  selectedItem,
  setSelectedItem,
  total,
  formMessage,
  submitForm,
}: {
  category: ReturnType<typeof getDemoCategory>;
  step: DemoStep;
  setStep: (step: DemoStep) => void;
  items: { name: string; detail: string; price: number }[];
  cart: Record<string, number>;
  setCart: (cart: Record<string, number>) => void;
  selectedItem: number;
  setSelectedItem: (index: number) => void;
  total: number;
  formMessage: string;
  submitForm: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  if (step === "done") {
    return <div className={styles.confirmation}><span className={styles.confirmationIcon}><Check size={24} /></span><span className={styles.siteEyebrow}>Demo complete</span><h2>{category.brand} is ready for its next customer.</h2><p>{formMessage}</p><button type="button" className={styles.secondaryButton} onClick={() => setStep("browse")}>Explore the site again</button></div>;
  }

  if (category.action === "cart") {
    if (step === "checkout") {
      return <div className={styles.flowContent}><div className={styles.flowHeading}><div><span className={styles.siteEyebrow}>Demo checkout</span><h2>Review your order, then confirm.</h2></div><button type="button" className={styles.resetButton} onClick={() => setStep("select")}>Back to basket <ArrowRight size={15} /></button></div><div className={styles.checkoutSummary}><span>{Object.values(cart).reduce((sum, value) => sum + value, 0)} item(s)</span><strong>{money(total)}</strong><small>Sandbox checkout · no payment is processed.</small></div><form className={styles.flowForm} onSubmit={submitForm}><label>Name<input required placeholder="Your name" /></label><label>Email<input type="email" required placeholder="you@example.com" /></label><label>Pickup or delivery note<textarea required placeholder="Anything the team should know?" /></label><button type="submit" className={styles.primaryButton}>Place demo order <ArrowRight size={16} /></button></form></div>;
    }
    return <div className={styles.flowContent}><div className={styles.flowHeading}><div><span className={styles.siteEyebrow}>Demo {category.id === "store" ? "shop" : "order"}</span><h2>Choose what you would like to {category.id === "store" ? "take home" : "enjoy"}.</h2></div><button type="button" className={styles.resetButton} onClick={() => setStep("browse")}>Close flow <X size={15} /></button></div><div className={styles.itemGrid}>{items.map((item, index) => <article className={styles.itemCard} key={item.name}><div className={styles.itemNumber}>0{index + 1}</div><h3>{item.name}</h3><p>{item.detail}</p><strong>{money(item.price)}</strong><button type="button" className={styles.smallButton} onClick={() => setCart({ ...cart, [item.name]: (cart[item.name] || 0) + 1 })}><Plus size={15} /> Add</button></article>)}</div><div className={styles.cartBar}><span>{Object.values(cart).reduce((sum, value) => sum + value, 0)} item(s) · {money(total)}</span><button type="button" className={styles.primaryButton} disabled={!total} onClick={() => setStep("checkout")}>Review checkout <ArrowRight size={16} /></button></div></div>;
  }

  if (step === "select" && category.action === "booking") {
    return <div className={styles.flowContent}><div className={styles.flowHeading}><div><span className={styles.siteEyebrow}>Choose a time</span><h2>Make a reservation that fits.</h2></div><button type="button" className={styles.resetButton} onClick={() => setStep("browse")}>Close flow <X size={15} /></button></div><div className={styles.itemGrid}>{items.map((item, index) => <button type="button" className={`${styles.itemCard} ${selectedItem === index ? styles.itemSelected : ""}`} key={item.name} onClick={() => setSelectedItem(index)}><div className={styles.itemNumber}>0{index + 1}</div><h3>{item.name}</h3><p>{item.detail}</p>{item.price ? <strong>{money(item.price)}</strong> : <strong>Available</strong>}</button>)}</div><form className={styles.flowForm} onSubmit={submitForm}><label>Date<input type="date" required defaultValue="2026-06-18" /></label><label>Time<select required defaultValue="18:00"><option>10:00</option><option>14:00</option><option>18:00</option></select></label><label>Name<input required placeholder="Your name" /></label><button type="submit" className={styles.primaryButton}>Confirm selection <ArrowRight size={16} /></button></form></div>;
  }

  if (category.action === "ai") {
    return <div className={styles.flowContent}><div className={styles.flowHeading}><div><span className={styles.siteEyebrow}>Guided AI demo</span><h2>Turn a loose idea into a useful first brief.</h2></div><button type="button" className={styles.resetButton} onClick={() => setStep("browse")}>Close flow <X size={15} /></button></div><form className={styles.aiForm} onSubmit={submitForm}><label htmlFor="demo-ai-idea">What are you thinking about?</label><textarea id="demo-ai-idea" required placeholder="I want to build a website for..." /><button type="submit" className={styles.primaryButton}>Create a project outline <ArrowRight size={16} /></button></form><div className={styles.aiResult}><strong>Example result</strong><p>Home · About · Services · Contact · a clear primary action · responsive layouts · room to grow.</p></div></div>;
  }

  const title = category.action === "viewing" ? "Request a private viewing" : category.action === "tickets" ? "Choose your tickets" : category.action === "donation" ? "Choose your support" : category.action === "waitlist" ? "Join the early access list" : "Tell the team what you need";
  const submitLabel = category.action === "donation" ? "Continue with this gift" : category.action === "tickets" ? "Reserve tickets" : category.action === "viewing" ? "Request viewing" : category.action === "waitlist" ? "Join the list" : "Send demo request";
  return <div className={styles.flowContent}><div className={styles.flowHeading}><div><span className={styles.siteEyebrow}>A clear next step</span><h2>{title}</h2></div><button type="button" className={styles.resetButton} onClick={() => setStep("browse")}>Close flow <X size={15} /></button></div><form className={styles.flowForm} onSubmit={submitForm}>{category.action === "tickets" && <div className={styles.ticketChoices}><button type="button" className={selectedItem === 0 ? styles.itemSelected : ""} onClick={() => setSelectedItem(0)}>Day pass · 450 SEK</button><button type="button" className={selectedItem === 1 ? styles.itemSelected : ""} onClick={() => setSelectedItem(1)}>Weekend pass · 850 SEK</button></div>}{category.action === "donation" && <div className={styles.donationChoices}>{[100, 250, 500].map(value => <button type="button" key={value} className={selectedItem === value ? styles.itemSelected : ""} onClick={() => setSelectedItem(value)}>{value} SEK</button>)}</div>}<label>Name<input required placeholder="Your name" /></label><label>Email<input type="email" required placeholder="you@example.com" /></label><label>{category.action === "viewing" ? "Preferred date" : "Message"}{category.action === "viewing" ? <input type="date" required defaultValue="2026-06-18" /> : <textarea required placeholder="Tell us a little more..." />}</label><button type="submit" className={styles.primaryButton}>{submitLabel} <ArrowRight size={16} /></button></form></div>;
}
