"use client";

import { useMemo, useState } from "react";
import {
  DemoFooter,
  ModalPanel,
  Photo,
  ProjectNav,
  scrollToSection,
} from "./shared";
import styles from "./online-store.module.css";

const products = [
  {
    id: "arc-jacket",
    name: "Arc jacket",
    category: "Clothing",
    price: 168,
    colors: ["Ink", "Oat"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "objects",
    tone: "ink",
    kind: "jacket",
    description: "A clean-lined layer with a softly structured shoulder and a light finish.",
    material: "Recycled nylon shell · Organic cotton lining",
  },
  {
    id: "soft-knit",
    name: "Soft knit crew",
    category: "Clothing",
    price: 94,
    colors: ["Moss", "Oat", "Clay"],
    sizes: ["XS", "S", "M", "L"],
    image: "interior",
    tone: "moss",
    kind: "knit",
    description: "A relaxed everyday knit with a gentle hand and a little extra room to move.",
    material: "Merino wool · Recycled cashmere",
  },
  {
    id: "wide-trouser",
    name: "Wide leg trouser",
    category: "Clothing",
    price: 122,
    colors: ["Stone", "Ink"],
    sizes: ["XS", "S", "M", "L"],
    image: "workspace",
    tone: "stone",
    kind: "trouser",
    description: "An easy, tailored trouser with a generous drape and a polished finish.",
    material: "Tencel twill · Recycled polyester",
  },
  {
    id: "line-runner",
    name: "Line runner",
    category: "Shoes",
    price: 146,
    colors: ["Chalk", "Ink"],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    image: "coast",
    tone: "chalk",
    kind: "shoe",
    description: "A light everyday trainer with a quiet profile and a supportive sole.",
    material: "Recycled mesh · Natural rubber sole",
  },
  {
    id: "low-heel",
    name: "Low heel mule",
    category: "Shoes",
    price: 158,
    colors: ["Clay", "Ink"],
    sizes: ["36", "37", "38", "39", "40", "41"],
    image: "chair",
    tone: "clay",
    kind: "shoe",
    description: "A softly squared mule with a stable heel for long days and late dinners.",
    material: "Responsibly sourced leather · Cork footbed",
  },
  {
    id: "city-boot",
    name: "City ankle boot",
    category: "Shoes",
    price: 184,
    colors: ["Ink", "Moss"],
    sizes: ["37", "38", "39", "40", "41"],
    image: "forest",
    tone: "forest",
    kind: "boot",
    description: "A weather-ready ankle boot with a practical zip and a softened edge.",
    material: "Waxed leather · Recycled lining · Rubber tread",
  },
] as const;

type Product = (typeof products)[number];
type Panel = "bag" | "checkout" | "confirmation" | null;
type CartLine = { product: Product; size: string; color: string; quantity: number };

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

function ProductVisual({ product, compact = false }: { product: Product; compact?: boolean }) {
  return (
    <div
      className={`${styles.productVisual} ${compact ? styles.compactVisual : ""}`}
      data-kind={product.kind}
      data-tone={product.tone}
      aria-hidden="true"
    >
      <span className={styles.visualShadow} />
      <span className={styles.visualObject} />
      <span className={styles.visualLabel}>{product.category === "Shoes" ? "VERRA / STEP" : "VERRA / FORM"}</span>
    </div>
  );
}

export default function OnlineStoreProject() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Featured");
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderName, setOrderName] = useState("");
  const [newsletter, setNewsletter] = useState("");

  const lines = Object.values(cart);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shown = useMemo(() => {
    const value = products
      .filter((product) => category === "All" || product.category === category)
      .filter((product) => product.name.toLowerCase().includes(search.trim().toLowerCase()));
    return [...value].sort((a, b) => {
      if (sort === "Price: low to high") return a.price - b.price;
      if (sort === "Price: high to low") return b.price - a.price;
      if (sort === "Newest") return products.indexOf(b) - products.indexOf(a);
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [category, search, sort]);

  function openProduct(product: Product) {
    setSelected(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setNotice("");
  }

  function addToBag(product: Product, size: string, color: string, amount: number) {
    const key = `${product.id}-${size}-${color}`;
    setCart((current) => ({
      ...current,
      [key]: {
        product,
        size,
        color,
        quantity: Math.min(10, (current[key]?.quantity || 0) + amount),
      },
    }));
    setNotice(`${product.name} added to your bag.`);
  }

  function changeLine(key: string, delta: number) {
    setCart((current) => {
      const line = current[key];
      if (!line) return current;
      const nextQuantity = Math.max(0, Math.min(10, line.quantity + delta));
      const next = { ...current };
      if (!nextQuantity) delete next[key];
      else next[key] = { ...line, quantity: nextQuantity };
      return next;
    });
  }

  return (
    <article className={styles.project} data-project="online-store" aria-label="VERRA online clothing and shoe store">
      <div data-project-content>
        <div className={styles.announcement}>Complimentary delivery on orders over {money(150)}.</div>
        <ProjectNav
          brand="VERRA"
          tagline="CLOTHING · SHOES · EVERYDAY FORM"
          links={[
            ["Shop", "shop"],
            ["New arrivals", "new"],
            ["Our materials", "story"],
            ["Help", "support"],
          ]}
          action={`Bag (${count})`}
          onAction={() => setPanel("bag")}
        />

        <section className={styles.hero} data-section="home">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>THE NEW EVERYDAY / 01</p>
            <h1>Made for the way you move.</h1>
            <p>Quietly confident clothing and shoes for the spaces between plans.</p>
            <button className={styles.primary} onClick={(e) => scrollToSection(e.currentTarget, "shop")}>Shop the edit <span aria-hidden="true">↗</span></button>
            <div className={styles.heroDetails}><span>Small-batch collections</span><span>Thoughtful materials</span></div>
          </div>
          <div className={styles.heroVisual}>
            <Photo name="objects" alt="Editorial still life for the VERRA clothing and shoe collection" priority />
            <div className={styles.heroOverlay}>
              <span>VERRA / SS26</span>
              <strong>Wear the day well.</strong>
            </div>
          </div>
        </section>

        <section className={styles.intro} data-section="new">
          <p className={styles.eyebrow}>A CONSIDERED WARDROBE</p>
          <h2>Less noise. More ways to wear it.</h2>
          <p>VERRA makes adaptable pieces with honest materials, clear proportions and enough room for your own point of view.</p>
        </section>

        <section className={styles.shop} data-section="shop">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>THE CURRENT EDIT</p><h2>Pieces with a point of view.</h2></div>
            <p>{shown.length} of {products.length} pieces shown.<br />Fictional products in a fully interactive preview.</p>
          </div>
          <div className={styles.shopTools}>
            <label className={styles.search}>Search products<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Try jacket or shoe" /></label>
            <label className={styles.sort}>Sort by<select value={sort} onChange={(e) => setSort(e.target.value)}><option>Featured</option><option>Newest</option><option>Price: low to high</option><option>Price: high to low</option></select></label>
          </div>
          <div className={styles.filters} aria-label="Product categories">
            {["All", "Clothing", "Shoes"].map((item) => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          {shown.length ? (
            <div className={styles.productGrid}>
              {shown.map((product) => (
                <article className={styles.productCard} key={product.id}>
                  <button className={styles.productButton} onClick={() => openProduct(product)} aria-label={`View ${product.name}`}>
                    <ProductVisual product={product} />
                    <span className={styles.productMeta}><span><strong>{product.name}</strong><small>{product.category} · {product.colors[0]}</small></span><b>{money(product.price)}</b></span>
                  </button>
                  <button className={styles.quickAdd} onClick={() => { addToBag(product, product.sizes[0], product.colors[0], 1); setPanel("bag"); }}>Quick add <span aria-hidden="true">+</span></button>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}><h3>No pieces match that search.</h3><p>Try another word or clear the filters to see the full VERRA edit.</p><button className={styles.secondary} onClick={() => { setSearch(""); setCategory("All"); }}>Clear search</button></div>
          )}
          {notice && <p className={styles.notice} role="status">{notice}</p>}
        </section>

        <section className={styles.materials} data-section="story">
          <Photo name="interior" alt="Soft natural textures used as inspiration for VERRA materials" />
          <div><p className={styles.eyebrow}>OUR MATERIALS / 02</p><h2>Designed to stay in rotation.</h2><p>We choose materials for feel, movement and long-term wear. Every piece is made to meet the rest of your wardrobe, not compete with it.</p><button className={styles.secondary} onClick={() => scrollToSection(document.querySelector(`[data-section="support"] button`) as HTMLElement, "support")}>Read about care <span aria-hidden="true">↗</span></button></div>
        </section>

        <section className={styles.support} data-section="support">
          <div><p className={styles.eyebrow}>GOOD TO KNOW / 03</p><h2>Everything clear before you order.</h2></div>
          <div className={styles.supportGrid}>
            <details open><summary>Shipping & returns <b>+</b></summary><p>Complimentary delivery over {money(150)}. Returns are accepted within 30 days in original condition.</p></details>
            <details><summary>Size guide <b>+</b></summary><p>Clothing runs true to size. For shoes, choose your usual EU size. The full guide is also available on every product detail.</p></details>
            <details><summary>Need a hand? <b>+</b></summary><p>Use the contact form in this demo to send a fictional question to the VERRA team.</p></details>
          </div>
        </section>

        <section className={styles.newsletter}>
          <p className={styles.eyebrow}>THE VERRA LETTER</p><h2>New pieces, considered notes.</h2>
          <form onSubmit={(e) => { e.preventDefault(); setNewsletter("You are on the demo list. No email was sent or stored."); }}><label htmlFor="verra-email">Email address</label><div><input id="verra-email" type="email" required placeholder="you@example.com" autoComplete="email" /><button className={styles.primary}>Join the letter</button></div><p role="status">{newsletter || "A fictional concept. Your address stays in this preview."}</p></form>
        </section>
        <DemoFooter brand="VERRA"><span className={styles.footerLine}>Clothing and shoes for the everyday, thoughtfully considered.</span></DemoFooter>
      </div>

      {selected && (
        <ModalPanel title={selected.name} wide onClose={() => setSelected(null)}>
          <div className={styles.productDetail}>
            <ProductVisual product={selected} />
            <div className={styles.detailCopy}>
              <p className={styles.eyebrow}>{selected.category.toUpperCase()} / VERRA EDIT</p>
              <h3>{selected.name}</h3><p className={styles.detailPrice}>{money(selected.price)}</p><p>{selected.description}</p>
              <h4>Colour</h4><div className={styles.optionRow}>{selected.colors.map((color) => <button key={color} aria-pressed={selectedColor === color} className={styles.option} onClick={() => setSelectedColor(color)}>{color}</button>)}</div>
              <h4>Size</h4><div className={styles.optionRow}>{selected.sizes.map((size) => <button key={size} aria-pressed={selectedSize === size} className={styles.option} onClick={() => setSelectedSize(size)}>{size}</button>)}</div>
              <details className={styles.detailGuide}><summary>Size guide <b>+</b></summary><p>XS  UK 6-8 · S  UK 8-10 · M  UK 10-12 · L  UK 12-14 · XL  UK 14-16. For shoes, sizes are EU.</p></details>
              <div className={styles.quantity}><button aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((value) => value - 1)}>−</button><output aria-label="Product quantity">{quantity}</output><button aria-label="Increase quantity" disabled={quantity === 10} onClick={() => setQuantity((value) => value + 1)}>+</button></div>
              <button className={styles.primary} disabled={!selectedSize} onClick={() => { addToBag(selected, selectedSize, selectedColor, quantity); setSelected(null); setPanel("bag"); }}>Add to bag · {money(selected.price * quantity)}</button>
              <p className={styles.detailNote}>{selected.material}. Demo product only; no purchase is made.</p>
            </div>
          </div>
        </ModalPanel>
      )}

      {panel && (
        <ModalPanel title={panel === "bag" ? `Your bag (${count})` : panel === "checkout" ? "Checkout preview" : "Order received"} onClose={() => setPanel(null)}>
          {panel === "bag" && (count === 0 ? <div className={styles.empty}><h3>Your bag is ready for something good.</h3><p>There is nothing here yet. Explore the VERRA edit and choose a piece to continue.</p><button className={styles.primary} onClick={() => setPanel(null)}>Continue shopping</button></div> : <div className={styles.cart}><div className={styles.cartLines}>{lines.map((line) => { const key = `${line.product.id}-${line.size}-${line.color}`; return <div className={styles.cartLine} key={key}><ProductVisual product={line.product} compact /><div><h3>{line.product.name}</h3><p>{line.color} · {line.size} · {money(line.product.price)}</p><div className={styles.quantity}><button aria-label={`Decrease ${line.product.name}`} onClick={() => changeLine(key, -1)}>−</button><output>{line.quantity}</output><button aria-label={`Increase ${line.product.name}`} onClick={() => changeLine(key, 1)}>+</button></div></div><button className={styles.remove} onClick={() => setCart((current) => { const next = { ...current }; delete next[key]; return next; })}>Remove</button></div>; })}</div><div className={styles.cartTotal}><span>Subtotal</span><strong>{money(total)}</strong></div><p className={styles.detailNote}>Demo checkout only. No payment or order is sent.</p><button className={styles.primary} onClick={() => setPanel("checkout")}>Continue to checkout</button><button className={styles.back} onClick={() => setPanel(null)}>Back to shopping</button></div>)}
          {panel === "checkout" && <form className={styles.checkout} onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); setOrderName(String(data.get("name")).split(" ")[0]); setOrderNumber(`VERRA-${Math.floor(1000 + Math.random() * 9000)}`); setCart({}); setPanel("confirmation"); }}><p>Enter sample details to preview the full VERRA checkout journey.</p><label>Full name<input name="name" required minLength={2} autoComplete="name" /></label><label>Email address<input name="email" type="email" required autoComplete="email" /></label><label>Shipping address<input name="address" required minLength={5} autoComplete="street-address" /></label><div className={styles.formRow}><label>City<input name="city" required autoComplete="address-level2" /></label><label>Postcode<input name="postcode" required autoComplete="postal-code" /></label></div><label>Delivery<select name="delivery" defaultValue="Standard"><option>Standard · 3-5 days · Free</option><option>Express · 1-2 days · {money(12)}</option></select></label><label>Payment preview<select name="payment" defaultValue="Demo card"><option>Demo card (no charge)</option><option>Klarna test flow (no charge)</option></select></label><button className={styles.primary}>Preview order</button><button type="button" className={styles.back} onClick={() => setPanel("bag")}>Back to bag</button></form>}
          {panel === "confirmation" && <div className={styles.empty}><span className={styles.success}>✓</span><h3>Thanks, {orderName}.</h3><p>Your demo order {orderNumber} is complete. No payment was collected and no personal data was stored.</p><button className={styles.primary} onClick={() => setPanel(null)}>Back to VERRA</button></div>}
        </ModalPanel>
      )}
    </article>
  );
}
