"use client";

import { useState } from "react";
import {
  DemoFooter,
  localToday,
  ModalPanel,
  Photo,
  ProjectNav,
  scrollToSection,
} from "./shared";
import styles from "./furniture.module.css";

const pieces = [
  {
    id: "sofa",
    name: "The Still Sofa",
    category: "Seating",
    price: 1450,
    image: "sofa",
    alt: "A deep green upholstered sofa with timber legs",
    description:
      "A generous place to settle in. Quiet lines, a supportive seat and room for the everyday.",
    dimensions: "W 210 × D 90 × H 78 cm",
    finishes: [
      { name: "Forest velvet", color: "#3f6356", extra: 0 },
      { name: "Oat linen", color: "#d3c8ad", extra: 120 },
      { name: "Clay weave", color: "#aa7b63", extra: 80 },
    ],
  },
  {
    id: "chair",
    name: "The Sunday Chair",
    category: "Seating",
    price: 420,
    image: "chair",
    alt: "A cream upholstered accent chair with a buttoned back",
    description:
      "A favourite corner, made comfortable. A softly upholstered seat with a timeless, considered silhouette.",
    dimensions: "W 64 × D 68 × H 92 cm",
    finishes: [
      { name: "Natural linen", color: "#dcd3b9", extra: 0 },
      { name: "Warm grey", color: "#a3a099", extra: 35 },
      { name: "Soft moss", color: "#7c8b6a", extra: 45 },
    ],
  },
  {
    id: "clock",
    name: "The Arc Clock",
    category: "Objects",
    price: 68,
    image: "objects",
    alt: "A wooden wall clock above a quiet arrangement of objects",
    description:
      "An everyday object, thoughtfully made. Warm timber and a simple face bring a little rhythm to your room.",
    dimensions: "Ø 30 × D 4 cm",
    finishes: [
      { name: "Natural oak", color: "#ba9970", extra: 0 },
      { name: "Smoked oak", color: "#795e42", extra: 12 },
      { name: "Pale ash", color: "#d5c1a4", extra: 8 },
    ],
  },
];
type Piece = (typeof pieces)[number];
type EditItem = {
  key: string;
  id: string;
  finish: string;
  price: number;
  quantity: number;
};
const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

export default function FurnitureProject() {
  const [category, setCategory] = useState("All pieces");
  const [selected, setSelected] = useState<Piece | null>(null);
  const [finish, setFinish] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState("piece");
  const [edit, setEdit] = useState<EditItem[]>([]);
  const [panel, setPanel] = useState<
    "edit" | "consultation" | "confirmation" | null
  >(null);
  const [notice, setNotice] = useState("");
  const [appointment, setAppointment] = useState({
    name: "",
    date: "",
    time: "",
    format: "",
  });
  const count = edit.reduce((sum, item) => sum + item.quantity, 0);
  const total = edit.reduce((sum, item) => sum + item.price * item.quantity, 0);
  function openPiece(piece: Piece) {
    setSelected(piece);
    setFinish(0);
    setQuantity(1);
    setPhoto("piece");
  }
  function savePiece() {
    if (!selected) return;
    const material = selected.finishes[finish];
    const key = `${selected.id}-${finish}`;
    setEdit((items) => {
      const found = items.find((item) => item.key === key);
      return found
        ? items.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
              : item,
          )
        : [
            ...items,
            {
              key,
              id: selected.id,
              finish: material.name,
              price: selected.price + material.extra,
              quantity,
            },
          ];
    });
    setNotice(
      `${selected.name} in ${material.name.toLowerCase()} added to your edit.`,
    );
    setSelected(null);
    setPanel("edit");
  }
  function changeQuantity(key: string, delta: number) {
    setEdit((items) =>
      items
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(10, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }
  return (
    <article
      className={styles.project}
      data-project="furniture"
      aria-label="FORM & FIELD furniture and interiors"
    >
      <div data-project-content>
        <div className={styles.announcement}>
          Thoughtful pieces. A more considered home.
        </div>
        <ProjectNav
          brand="FORM & FIELD"
          links={[
            ["The collection", "collection"],
            ["In good company", "spaces"],
            ["Our materials", "materials"],
          ]}
          action={`Your edit (${count})`}
          onAction={() => setPanel("edit")}
        />
        <section className={styles.hero} data-section="home">
          <Photo
            name="living-room"
            alt="A sunlit living room with warm timber, greenery and relaxed seating"
            className={styles.heroPhoto}
            sizes="(max-width:700px) 1000px, 1800px"
            priority
          />
          <div className={styles.heroCard}>
            <p className={styles.eyebrow}>A HOME, WELL CONSIDERED.</p>
            <h1>
              Made for
              <br />
              <em>living.</em>
            </h1>
            <p>
              Quiet forms. Honest materials. Pieces that feel a little more like
              you, and a little less like everyone else.
            </p>
            <button
              className={styles.primary}
              onClick={(e) => scrollToSection(e.currentTarget, "collection")}
            >
              Discover the collection ↗
            </button>
          </div>
          <span className={styles.heroCaption}>
            THE ART OF EVERYDAY LIVING / 01
          </span>
        </section>
        <section className={styles.collection} data-section="collection">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>FEWER THINGS. BETTER THINGS.</p>
              <h2>A place in your everyday.</h2>
            </div>
            <p>
              Considered essentials.
              <br />A collection to make your own.
            </p>
          </div>
          <div className={styles.filters} aria-label="Furniture categories">
            {["All pieces", "Seating", "Objects"].map((item) => (
              <button
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className={styles.productGrid}>
            {pieces
              .filter(
                (piece) =>
                  category === "All pieces" || piece.category === category,
              )
              .map((piece) => (
                <button
                  key={piece.id}
                  data-piece={piece.id}
                  className={styles.product}
                  onClick={() => openPiece(piece)}
                  aria-label={`Explore ${piece.name}`}
                >
                  <Photo
                    name={piece.image}
                    alt={piece.alt}
                    className={`${styles.productPhoto} ${piece.id === "clock" ? styles.objectPhoto : ""}`}
                  />
                  <div>
                    <span>{piece.category}</span>
                    <h3>{piece.name}</h3>
                    <p>
                      From {money(piece.price)} <span>Explore finishes ↗</span>
                    </p>
                    <div className={styles.miniSwatches} aria-hidden="true">
                      {piece.finishes.map((item) => (
                        <i key={item.name} style={{ background: item.color }} />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
          </div>
          <p className={styles.notice} role="status">
            {notice}
          </p>
        </section>
        <section className={styles.spaces} data-section="spaces">
          <Photo
            name="interior"
            alt="A contemporary living space with natural timber and a pale sofa"
            className={styles.spacePhoto}
          />
          <div>
            <p className={styles.eyebrow}>IN GOOD COMPANY.</p>
            <h2>
              A little room
              <br />
              to <em>be yourself.</em>
            </h2>
            <p>
              The best rooms aren't perfect. They're personal. A place for the
              things you love, the people you invite in, and the small moments
              that make a day.
            </p>
            <button
              className={styles.textButton}
              onClick={() => setPanel("consultation")}
            >
              Find your direction with us ↗
            </button>
          </div>
        </section>
        <section className={styles.materials} data-section="materials">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>THE FEEL OF SOMETHING REAL.</p>
              <h2>
                Good things start
                <br />
                with honest materials.
              </h2>
            </div>
            <p>
              Choose a finish. Make it yours.
              <br />
              Thoughtful textures for everyday life.
            </p>
          </div>
          <div className={styles.materialGrid}>
            {[
              [
                "Natural timber",
                "Grain, warmth and character. No two pieces feel exactly the same.",
                "wood",
              ],
              [
                "Soft woven textiles",
                "Tactile fabrics that invite you to slow down and settle in.",
                "textile",
              ],
              [
                "Considered details",
                "Simple forms, purposeful joinery and the finishing touches that last.",
                "detail",
              ],
            ].map(([name, text, material]) => (
              <div key={name}>
                <div
                  className={`${styles.materialArt} ${styles[material]}`}
                  aria-hidden="true"
                />
                <h3>{name}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.consultation}>
          <p className={styles.eyebrow}>A LITTLE HELP, WHEN YOU NEED IT.</p>
          <h2>
            Your space.
            <br />
            <em>Our shared starting point.</em>
          </h2>
          <p>
            Bring your ideas, your questions, or just a room that needs a little
            direction.
          </p>
          <button
            className={styles.primary}
            onClick={() => setPanel("consultation")}
          >
            Plan a design conversation ↗
          </button>
        </section>
        <DemoFooter brand="FORM & FIELD">
          <span className={styles.footerNote}>
            Furniture, objects & everyday living.
          </span>
        </DemoFooter>
      </div>
      {selected && (
        <ModalPanel
          title={selected.name}
          wide
          onClose={() => setSelected(null)}
        >
          <div className={styles.detail}>
            <div>
              <Photo
                name={photo === "piece" ? selected.image : "living-room"}
                alt={
                  photo === "piece"
                    ? selected.alt
                    : "A thoughtfully furnished living room"
                }
                className={styles.detailPhoto}
              />
              <div className={styles.photoControls}>
                <button
                  aria-pressed={photo === "piece"}
                  onClick={() => setPhoto("piece")}
                >
                  The piece
                </button>
                <button
                  aria-pressed={photo === "room"}
                  onClick={() => setPhoto("room")}
                >
                  Room inspiration
                </button>
              </div>
              <p className={styles.small}>
                Display photograph. Finish options are shown in the material
                swatches.
              </p>
            </div>
            <div>
              <p className={styles.eyebrow}>
                {selected.category.toUpperCase()} / THE EVERYDAY COLLECTION
              </p>
              <p className={styles.price}>
                {money(selected.price + selected.finishes[finish].extra)}
              </p>
              <p>{selected.description}</p>
              <h3>Choose your finish</h3>
              <div className={styles.swatches} aria-label="Finish options">
                {selected.finishes.map((item, i) => (
                  <button
                    key={item.name}
                    aria-pressed={finish === i}
                    onClick={() => setFinish(i)}
                  >
                    <i style={{ background: item.color }} aria-hidden="true" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
              <p className={styles.selection} role="status">
                Selected: {selected.finishes[finish].name}
              </p>
              <dl className={styles.specs}>
                <div>
                  <dt>Dimensions</dt>
                  <dd>{selected.dimensions}</dd>
                </div>
                <div>
                  <dt>Lead time</dt>
                  <dd>Made to order · 4–6 weeks</dd>
                </div>
              </dl>
              <div className={styles.quantity}>
                <button
                  aria-label="Decrease piece quantity"
                  disabled={quantity === 1}
                  onClick={() => setQuantity((n) => n - 1)}
                >
                  −
                </button>
                <output aria-label="Piece quantity">{quantity}</output>
                <button
                  aria-label="Increase piece quantity"
                  disabled={quantity === 5}
                  onClick={() => setQuantity((n) => n + 1)}
                >
                  +
                </button>
              </div>
              <button className={styles.primary} onClick={savePiece}>
                Save to your edit —{" "}
                {money(
                  (selected.price + selected.finishes[finish].extra) * quantity,
                )}
              </button>
              <p className={styles.small}>
                Build a project edit. Illustrative prices; no purchase is made.
              </p>
            </div>
          </div>
        </ModalPanel>
      )}
      {panel && (
        <ModalPanel
          title={
            panel === "edit"
              ? "Your considered edit"
              : panel === "consultation"
                ? "Let's make room for your ideas."
                : "A good place to begin."
          }
          onClose={() => setPanel(null)}
        >
          {panel === "edit" && (
            <>
              {edit.length ? (
                <>
                  <p className={styles.small}>
                    A starting point for your home. Change quantities or refine
                    your selection.
                  </p>
                  <div className={styles.editList}>
                    {edit.map((item) => {
                      const piece = pieces.find((p) => p.id === item.id)!;
                      return (
                        <div key={item.key}>
                          <Photo
                            name={piece.image}
                            alt={piece.alt}
                            className={styles.editPhoto}
                          />
                          <div>
                            <h3>{piece.name}</h3>
                            <p>
                              {item.finish} · {money(item.price)}
                            </p>
                            <div className={styles.quantity}>
                              <button
                                aria-label={`Decrease ${piece.name} quantity`}
                                onClick={() => changeQuantity(item.key, -1)}
                              >
                                −
                              </button>
                              <output>{item.quantity}</output>
                              <button
                                aria-label={`Increase ${piece.name} quantity`}
                                disabled={item.quantity === 10}
                                onClick={() => changeQuantity(item.key, 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className={styles.remove}
                              aria-label={`Remove ${piece.name} in ${item.finish}`}
                              onClick={() =>
                                setEdit((items) =>
                                  items.filter((i) => i.key !== item.key),
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.estimate}>
                    <span>Project estimate</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <button
                    className={styles.primary}
                    onClick={() => setPanel("consultation")}
                  >
                    Discuss your edit ↗
                  </button>
                </>
              ) : (
                <div className={styles.empty}>
                  <h3>A little room for possibility.</h3>
                  <p>
                    Explore the collection and save the pieces and finishes you
                    love.
                  </p>
                  <button
                    className={styles.primary}
                    onClick={() => setPanel(null)}
                  >
                    Explore the collection
                  </button>
                </div>
              )}
            </>
          )}
          {panel === "consultation" && (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                setAppointment({
                  name: String(data.get("name")).split(" ")[0],
                  date: String(data.get("date")),
                  time: String(data.get("time")),
                  format: String(data.get("format")),
                });
                setPanel("confirmation");
              }}
            >
              <p>
                A calm, practical conversation about your space.
                {count
                  ? ` Your edit includes ${count} pieces, estimated at ${money(total)}.`
                  : " Bring a few ideas, and we'll start there."}
              </p>
              <label>
                Your name
                <input name="name" required minLength={2} autoComplete="name" />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Preferred date
                  <input name="date" type="date" min={localToday()} required />
                </label>
                <label>
                  Preferred time
                  <select name="time">
                    <option>10:00</option>
                    <option>13:00</option>
                    <option>16:00</option>
                  </select>
                </label>
              </div>
              <label>
                Conversation format
                <select name="format">
                  <option>Video conversation</option>
                  <option>Studio visit</option>
                </select>
              </label>
              <label>
                Tell us about your space
                <textarea name="space" required minLength={12} rows={3} />
              </label>
              <button className={styles.primary}>
                Preview consultation ↗
              </button>
              <small>
                Sample appointment options. No booking or enquiry is sent.
              </small>
            </form>
          )}
          {panel === "confirmation" && (
            <div className={styles.empty}>
              <p className={styles.eyebrow}>
                YOUR IDEAS HAVE A STARTING POINT.
              </p>
              <h3>Thank you, {appointment.name}.</h3>
              <p>
                {appointment.format}
                <br />
                {appointment.date} · {appointment.time}
              </p>
              <p>
                Your consultation preview is complete. No appointment has been
                booked and no personal information was stored.
              </p>
              <button className={styles.primary} onClick={() => setPanel(null)}>
                Back to FORM & FIELD
              </button>
            </div>
          )}
        </ModalPanel>
      )}
    </article>
  );
}
