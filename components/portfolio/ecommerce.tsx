"use client";

import { useState } from "react";
import {
  DemoFooter,
  ModalPanel,
  Photo,
  ProjectNav,
  scrollToSection,
} from "./shared";
import ProductArt from "./product-art";
import styles from "./ecommerce.module.css";

const products = [
  {
    id: "serum",
    name: "The Daily Serum",
    kind: "serum" as const,
    category: "Treat",
    price: 38,
    tone: "sage" as const,
    note: "A quiet reset for thirsty skin.",
    ingredients: "Hyaluronic acid · Oat extract · Glycerin",
    use: "Smooth two drops onto clean, damp skin. Follow with moisturiser.",
    background: "#e3e8dc",
  },
  {
    id: "cleanser",
    name: "The Gentle Cleanse",
    kind: "cleanser" as const,
    category: "Cleanse",
    price: 24,
    tone: "cream" as const,
    note: "A soft start. A clean slate.",
    ingredients: "Aloe · Oat milk · Plant-derived cleansing agents",
    use: "Massage one pump onto damp skin, then rinse with warm water.",
    background: "#eee9de",
  },
  {
    id: "cream",
    name: "The Everyday Cream",
    kind: "cream" as const,
    category: "Moisturise",
    price: 32,
    tone: "clay" as const,
    note: "Lasting comfort, without the weight.",
    ingredients: "Squalane · Ceramides · Shea butter",
    use: "Press a small amount into skin after your serum, morning and evening.",
    background: "#efe0d6",
  },
  {
    id: "night",
    name: "The Night Ritual",
    kind: "serum" as const,
    category: "Treat",
    price: 44,
    tone: "clay" as const,
    note: "An unhurried end to your day.",
    ingredients: "Rosehip oil · Vitamin E · Evening primrose",
    use: "Warm two drops between your palms and gently press into skin before bed.",
    background: "#e7d8ce",
  },
];
const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

export default function EcommerceProject() {
  const [filter, setFilter] = useState("All essentials");
  const [sort, setSort] = useState("Featured");
  const [selected, setSelected] = useState<(typeof products)[number] | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [panel, setPanel] = useState<
    "bag" | "checkout" | "confirmation" | null
  >(null);
  const [emailStatus, setEmailStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [orderName, setOrderName] = useState("");
  const count = Object.values(cart).reduce((sum, amount) => sum + amount, 0);
  const total = products.reduce(
    (sum, p) => sum + p.price * (cart[p.id] || 0),
    0,
  );
  const shown = products
    .filter((p) => filter === "All essentials" || p.category === filter)
    .sort((a, b) =>
      sort === "Price: low to high"
        ? a.price - b.price
        : sort === "Price: high to low"
          ? b.price - a.price
          : products.indexOf(a) - products.indexOf(b),
    );
  function add(id: string, amount = 1) {
    setCart((value) => ({
      ...value,
      [id]: Math.min(10, (value[id] || 0) + amount),
    }));
    setNotice("Added to your bag.");
  }
  function change(id: string, delta: number) {
    setCart((value) => {
      const next = {
        ...value,
        [id]: Math.max(0, Math.min(10, (value[id] || 0) + delta)),
      };
      if (!next[id]) delete next[id];
      return next;
    });
  }
  return (
    <article
      className={styles.project}
      data-project="ecommerce"
      aria-label="MORROW skincare shop"
    >
      <div data-project-content>
        <div className={styles.announcement}>
          Fewer steps. Better rituals.{" "}
          <span>Complimentary delivery over £60.</span>
        </div>
        <ProjectNav
          brand="MORROW"
          links={[
            ["Shop essentials", "shop"],
            ["Our approach", "approach"],
            ["Stay in the loop", "journal"],
          ]}
          action={`Bag (${count})`}
          onAction={() => setPanel("bag")}
        />
        <section className={styles.hero} data-section="home">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>LESS, BUT BETTER.</p>
            <h1>
              Good skin.
              <br />
              <em>Simple days.</em>
            </h1>
            <p>
              Considered essentials for your everyday. A little less in your
              routine. A little more room to breathe.
            </p>
            <button
              className={styles.button}
              onClick={(e) => scrollToSection(e.currentTarget, "shop")}
            >
              Find your everyday
            </button>
            <div className={styles.heroFacts}>
              <span>Thoughtfully formulated</span>
              <span>Made for your daily rhythm</span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <span className={styles.visualCaption}>
              THE EVERYDAY COLLECTION / 01
            </span>
            <div className={styles.heroBottle}>
              <ProductArt name="Daily serum" />
            </div>
            <div className={styles.heroJar}>
              <ProductArt type="cream" tone="clay" name="Everyday cream" />
            </div>
            <span className={styles.visualNote}>
              Skin, simply.
              <br />
              Nothing more. Nothing less.
            </span>
          </div>
        </section>
        <div className={styles.values}>
          <span>Plant-led ingredients</span>
          <span>Considered packaging</span>
          <span>A simpler routine</span>
          <span>Everyday, elevated</span>
        </div>
        <section className={styles.shop} data-section="shop">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>YOUR DAILY LINE-UP</p>
              <h2>A good place to start.</h2>
            </div>
            <p>
              Four essentials.
              <br />
              One more considered routine.
            </p>
          </div>
          <div className={styles.shopTools}>
            <div className={styles.filters} aria-label="Product categories">
              {["All essentials", "Cleanse", "Treat", "Moisturise"].map(
                (category) => (
                  <button
                    key={category}
                    aria-pressed={filter === category}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </button>
                ),
              )}
            </div>
            <label className={styles.sort}>
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Featured</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
            </label>
          </div>
          <p className={styles.resultCount} role="status">
            {shown.length} essentials
          </p>
          <div className={styles.productGrid}>
            {shown.map((product) => (
              <div
                key={product.id}
                className={styles.productCard}
                data-product={product.id}
              >
                <button
                  className={styles.productImage}
                  style={{ background: product.background }}
                  onClick={() => {
                    setSelected(product);
                    setQuantity(1);
                  }}
                  aria-label={`View ${product.name}`}
                >
                  <ProductArt
                    type={product.kind}
                    tone={product.tone}
                    name={product.name.replace("The ", "")}
                  />
                  <span>Explore essential</span>
                </button>
                <div className={styles.productHeading}>
                  <h3>{product.name}</h3>
                  <span>{money(product.price)}</span>
                </div>
                <p>{product.note}</p>
                <button
                  className={styles.addButton}
                  onClick={() => add(product.id)}
                >
                  Add to bag
                </button>
              </div>
            ))}
          </div>
          <p className={styles.notice} role="status">
            {notice}
          </p>
        </section>
        <section className={styles.approach} data-section="approach">
          <Photo
            name="forest"
            alt="Sunlight falling through a green woodland canopy"
            className={styles.approachPhoto}
          />
          <div>
            <p className={styles.eyebrow}>THE MORROW WAY</p>
            <h2>
              Make space
              <br />
              for the essentials.
            </h2>
            <p>
              Skincare should feel like a moment to yourself, not another thing
              to get right. We start with purposeful ingredients and finish with
              formulas that fit into real life.
            </p>
            <dl>
              <div>
                <dt>01</dt>
                <dd>Every ingredient has a purpose.</dd>
              </div>
              <div>
                <dt>02</dt>
                <dd>Simple steps you can keep coming back to.</dd>
              </div>
              <div>
                <dt>03</dt>
                <dd>Thoughtful by design, from formula to bottle.</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className={styles.newsletter} data-section="journal">
          <div>
            <p className={styles.eyebrow}>A LITTLE NOTE FROM US</p>
            <h2>
              Good things,
              <br />
              every now and then.
            </h2>
            <p>Stories, rituals and a quieter kind of inspiration.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmailStatus(
                "You're on the demo list. No email was sent or stored.",
              );
            }}
          >
            <label htmlFor="morrow-email">Your email address</label>
            <div>
              <input
                id="morrow-email"
                type="email"
                required
                placeholder="Email address"
                autoComplete="email"
              />
              <button className={styles.button}>Join the list</button>
            </div>
            <p role="status">
              {emailStatus ||
                "A fictional concept. Your address stays in this preview."}
            </p>
          </form>
        </section>
        <DemoFooter brand="MORROW">
          <span className={styles.footerNote}>Skin, simply.</span>
        </DemoFooter>
      </div>
      {selected && (
        <ModalPanel
          title={selected.name}
          wide
          onClose={() => setSelected(null)}
        >
          <div className={styles.productDetail}>
            <div
              className={styles.detailArt}
              style={{ background: selected.background }}
            >
              <ProductArt
                type={selected.kind}
                tone={selected.tone}
                name={selected.name.replace("The ", "")}
              />
            </div>
            <div>
              <p className={styles.eyebrow}>
                {selected.category.toUpperCase()} / YOUR DAILY ESSENTIAL
              </p>
              <p className={styles.detailPrice}>{money(selected.price)}</p>
              <p>{selected.note}</p>
              <h3>Inside the formula</h3>
              <p>{selected.ingredients}</p>
              <h3>Make it a ritual</h3>
              <p>{selected.use}</p>
              <div className={styles.quantity}>
                <button
                  aria-label="Decrease product quantity"
                  disabled={quantity === 1}
                  onClick={() => setQuantity((q) => q - 1)}
                >
                  −
                </button>
                <output aria-label="Product quantity">{quantity}</output>
                <button
                  aria-label="Increase product quantity"
                  disabled={quantity === 10}
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <button
                className={styles.button}
                onClick={() => {
                  add(selected.id, quantity);
                  setSelected(null);
                  setPanel("bag");
                }}
              >
                Add to bag — {money(selected.price * quantity)}
              </button>
              <p className={styles.small}>
                Fictional products. No purchase is made in this preview.
              </p>
            </div>
          </div>
        </ModalPanel>
      )}
      {panel && (
        <ModalPanel
          title={
            panel === "bag"
              ? `Your bag (${count})`
              : panel === "checkout"
                ? "A few final details"
                : "Your ritual is on its way"
          }
          onClose={() => setPanel(null)}
        >
          {panel === "bag" && (
            <>
              {count === 0 ? (
                <div className={styles.empty}>
                  <h3>A little room for something good.</h3>
                  <p>
                    Your bag is empty. Explore the essentials and start your
                    routine.
                  </p>
                  <button
                    className={styles.button}
                    onClick={() => setPanel(null)}
                  >
                    Keep exploring
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.cartLines}>
                    {products
                      .filter((p) => cart[p.id])
                      .map((p) => (
                        <div className={styles.cartLine} key={p.id}>
                          <div className={styles.cartArt}>
                            <ProductArt
                              type={p.kind}
                              tone={p.tone}
                              name={p.name.replace("The ", "")}
                            />
                          </div>
                          <div>
                            <h3>{p.name}</h3>
                            <span>{money(p.price)}</span>
                            <div className={styles.quantity}>
                              <button
                                aria-label={`Decrease ${p.name} quantity`}
                                onClick={() => change(p.id, -1)}
                              >
                                −
                              </button>
                              <output>{cart[p.id]}</output>
                              <button
                                aria-label={`Increase ${p.name} quantity`}
                                disabled={cart[p.id] >= 10}
                                onClick={() => change(p.id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            className={styles.remove}
                            aria-label={`Remove ${p.name}`}
                            onClick={() =>
                              setCart((v) => {
                                const next = { ...v };
                                delete next[p.id];
                                return next;
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                  <div className={styles.cartTotal}>
                    <span>Subtotal</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <p className={styles.small}>
                    {total >= 60
                      ? "Complimentary delivery included."
                      : `${money(60 - total)} away from complimentary delivery.`}{" "}
                    Demo checkout only.
                  </p>
                  <button
                    className={styles.button}
                    onClick={() => setPanel("checkout")}
                  >
                    Continue to checkout
                  </button>
                </>
              )}
            </>
          )}
          {panel === "checkout" && (
            <form
              className={styles.checkout}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                setOrderName(String(data.get("name")).split(" ")[0]);
                setCart({});
                setPanel("confirmation");
              }}
            >
              <p>
                Your essentials · {money(total)}. This is a preview, with no
                payment or order sent.
              </p>
              <label>
                Full name
                <input name="name" autoComplete="name" required minLength={2} />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Delivery address
                <input
                  name="address"
                  autoComplete="street-address"
                  required
                  minLength={5}
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  City
                  <input name="city" autoComplete="address-level2" required />
                </label>
                <label>
                  Postcode
                  <input name="postcode" autoComplete="postal-code" required />
                </label>
              </div>
              <button className={styles.button}>Preview your order</button>
              <button
                type="button"
                className={styles.back}
                onClick={() => setPanel("bag")}
              >
                Back to bag
              </button>
            </form>
          )}
          {panel === "confirmation" && (
            <div className={styles.empty}>
              <span className={styles.success}>✓</span>
              <h3>Thank you, {orderName}.</h3>
              <p>
                Your demo order is complete. No payment was collected, no
                personal data was stored, and no products will be shipped.
              </p>
              <button className={styles.button} onClick={() => setPanel(null)}>
                Back to MORROW
              </button>
            </div>
          )}
        </ModalPanel>
      )}
    </article>
  );
}
