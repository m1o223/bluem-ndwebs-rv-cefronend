"use client";

import { useRef, useState } from "react";
import {
  DemoFooter,
  localToday,
  ModalPanel,
  Photo,
  ProjectNav,
  scrollToSection,
} from "./shared";
import styles from "./restaurant.module.css";

const dishes = [
  {
    id: "salad",
    name: "The garden, on a plate",
    category: "To start",
    image: "salad",
    alt: "A vibrant salad of fresh vegetables, greens and chickpeas",
    price: 12,
    vegetarian: true,
    description:
      "Seasonal leaves, roasted vegetables, chickpeas and a bright lemon dressing.",
    ingredients:
      "Seasonal greens · Chickpeas · Roasted squash · Lemon · Olive oil",
    allergens: "No listed allergens in this illustrative recipe.",
  },
  {
    id: "pesto",
    name: "Pappardelle verde",
    category: "Pasta",
    image: "pesto",
    alt: "Ribbon pasta with fresh herbs and a generous scattering of parmesan",
    price: 21,
    vegetarian: true,
    description:
      "Wide ribbons, garden herbs, toasted nuts and a little more parmesan.",
    ingredients:
      "Fresh egg pasta · Basil · Pine nuts · Vegetarian hard cheese · Olive oil",
    allergens: "Wheat · Egg · Milk · Pine nuts",
  },
  {
    id: "chicken",
    name: "Roast chicken tagliatelle",
    category: "Pasta",
    image: "pasta",
    alt: "A generous plate of golden tagliatelle with herbs and vegetables",
    price: 24,
    vegetarian: false,
    description:
      "Slow-roasted chicken, golden pasta and the kind of sauce you save the bread for.",
    ingredients: "Fresh egg pasta · Chicken · Mushrooms · Cream · Thyme",
    allergens: "Wheat · Egg · Milk",
  },
  {
    id: "panna",
    name: "A little panna cotta",
    category: "Dolci",
    image: "dessert",
    alt: "Cream desserts in small glass jars topped with fresh strawberries",
    price: 9,
    vegetarian: true,
    description:
      "A softly set vanilla cream, strawberries and a sweet end to the evening.",
    ingredients: "Cream · Vanilla · Plant-based setting agent · Strawberries",
    allergens: "Milk",
  },
  {
    id: "aperitivo",
    name: "The citrus aperitivo",
    category: "Drinks",
    image: "drinks",
    alt: "Fresh citrus drinks garnished with fruit and herbs",
    price: 11,
    vegetarian: true,
    description:
      "Bright citrus, a gentle bitterness and a good reason to take your time.",
    ingredients: "Citrus · Botanical aperitif · Soda · Orange",
    allergens: "Contains alcohol. Sample drink only.",
  },
  {
    id: "spritz",
    name: "Garden spritz",
    category: "Drinks",
    image: "drinks",
    alt: "Colourful drinks with fresh fruit and herb garnishes",
    price: 8,
    vegetarian: true,
    description:
      "Lemon, garden herbs and bubbles. A fresh little something, without the alcohol.",
    ingredients: "Lemon · Mint · Botanical cordial · Sparkling water",
    allergens: "Alcohol-free. No listed allergens in this illustrative recipe.",
  },
];
const times = ["17:30", "18:30", "19:30", "20:30"];
function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

export default function RestaurantProject() {
  const [category, setCategory] = useState("All");
  const [vegetarian, setVegetarian] = useState(false);
  const [selected, setSelected] = useState<(typeof dishes)[number] | null>(
    null,
  );
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState({ name: "", email: "", notes: "" });
  const timesContainer = useRef<HTMLDivElement>(null);
  const [bookingError, setBookingError] = useState("");
  const closed = Boolean(date && new Date(`${date}T12:00:00`).getDay() === 1);
  const serviceTimes =
    date && new Date(`${date}T12:00:00`).getDay() === 0
      ? ["12:30", "13:30", "17:30", "18:30"]
      : times;
  const shown = dishes.filter(
    (dish) =>
      (category === "All" || dish.category === category) &&
      (!vegetarian || dish.vegetarian),
  );
  function reserve() {
    setSelected(null);
    setBooking(true);
    setStep(1);
    setBookingError("");
  }
  function available(slot: string) {
    return (
      serviceTimes.includes(slot) &&
      !closed &&
      !(Number(guests) > 4 && slot === "19:30") &&
      !(Number(guests) > 6 && slot === "17:30")
    );
  }
  return (
    <article
      className={styles.project}
      data-project="restaurant"
      aria-label="SERA neighbourhood restaurant"
    >
      <div data-project-content>
        <div className={styles.announcement}>
          GOOD FOOD. GOOD COMPANY. A LITTLE MORE TIME.
        </div>
        <ProjectNav
          brand="SERA"
          tagline="A NEIGHBOURHOOD TABLE"
          links={[
            ["The menu", "menu"],
            ["Our story", "story"],
            ["Find us", "visit"],
          ]}
          action="Reserve a table"
          onAction={reserve}
        />
        <section className={styles.hero} data-section="home">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>COME IN. STAY A LITTLE.</p>
            <h1>
              A little Italy.
              <br />A <em>good evening.</em>
            </h1>
            <p>
              Fresh pasta, seasonal plates and a table that always feels like a
              good idea.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.primary} onClick={reserve}>
                Book a table
              </button>
              <button
                className={styles.textButton}
                onClick={(e) => scrollToSection(e.currentTarget, "menu")}
              >
                See what's cooking ↗
              </button>
            </div>
            <span className={styles.heroNote}>
              AN UNHURRIED KIND OF EVENING.
            </span>
          </div>
          <div className={styles.heroVisual}>
            <Photo
              name="pesto"
              alt="Fresh ribbon pasta with herbs and parmesan, ready for the table"
              className={styles.heroPhoto}
              priority
            />
            <span className={styles.photoLabel}>
              MADE FRESH.
              <br />
              SHARED HAPPILY.
            </span>
          </div>
        </section>
        <div className={styles.ribbon}>
          <span>Fresh pasta, daily.</span>
          <i aria-hidden="true">✳</i>
          <span>Seasonal by nature.</span>
          <i aria-hidden="true">✳</i>
          <span>Always good company.</span>
        </div>
        <section className={styles.menuSection} data-section="menu">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>SOMETHING GOOD IS ON THE TABLE.</p>
              <h2>
                Made with care.
                <br />
                <em>Best shared.</em>
              </h2>
            </div>
            <p>
              A few favourites from our kitchen.
              <br />
              Simple things, thoughtfully done.
            </p>
          </div>
          <div className={styles.menuTools}>
            <div className={styles.categories} aria-label="Menu categories">
              {["All", "To start", "Pasta", "Dolci", "Drinks"].map((item) => (
                <button
                  key={item}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className={styles.dietary}>
              <input
                type="checkbox"
                checked={vegetarian}
                onChange={(e) => setVegetarian(e.target.checked)}
              />
              Vegetarian only
            </label>
          </div>
          <p className={styles.count} role="status">
            {shown.length} good reasons to stay
          </p>
          <div className={styles.dishGrid}>
            {shown.map((dish) => (
              <button
                key={dish.id}
                className={styles.dish}
                data-dish={dish.id}
                aria-label={`Discover ${dish.name}`}
                onClick={() => setSelected(dish)}
              >
                <Photo
                  name={dish.image}
                  alt={dish.alt}
                  className={styles.dishPhoto}
                />
                <div className={styles.dishCopy}>
                  <div>
                    <span>
                      {dish.category.toUpperCase()}
                      {dish.vegetarian ? " / V" : ""}
                    </span>
                    <strong>£{dish.price}</strong>
                  </div>
                  <h3>{dish.name}</h3>
                  <p>{dish.description}</p>
                  <span>Take a closer look ↗</span>
                </div>
              </button>
            ))}
          </div>
          <p className={styles.menuNote}>
            A fictional seasonal menu. Photography and recipes are illustrative.
            Dish details include sample allergen information.
          </p>
        </section>
        <section className={styles.story} data-section="story">
          <Photo
            name="restaurant"
            alt="A welcoming restaurant with warm lighting and timber tables"
            className={styles.storyPhoto}
          />
          <div>
            <p className={styles.eyebrow}>THERE'S ALWAYS ROOM FOR ONE MORE.</p>
            <h2>
              A good table.
              <br />
              <em>A better evening.</em>
            </h2>
            <p>
              SERA is a fictional neighbourhood restaurant built around a simple
              idea: good ingredients, a little care, and enough time to enjoy
              the people you're with.
            </p>
            <p>
              From the first aperitivo to the last spoonful, we like things
              honest, seasonal and made to share.
            </p>
            <button className={styles.textButton} onClick={reserve}>
              Make an evening of it ↗
            </button>
          </div>
        </section>
        <section className={styles.visit} data-section="visit">
          <div>
            <p className={styles.eyebrow}>YOUR EVENING STARTS HERE.</p>
            <h2>
              Pull up
              <br />
              <em>a chair.</em>
            </h2>
            <button className={styles.primary} onClick={reserve}>
              Reserve your table ↗
            </button>
          </div>
          <div className={styles.visitDetails}>
            <div>
              <h3>Find the neighbourhood</h3>
              <p>
                12 Olive Lane
                <br />
                Bristol, our fictional home.
              </p>
              <span>Concept address · No physical restaurant</span>
            </div>
            <div>
              <h3>A little time for dinner</h3>
              <dl>
                <div>
                  <dt>Tuesday – Saturday</dt>
                  <dd>17:00 – 22:00</dd>
                </div>
                <div>
                  <dt>Sunday</dt>
                  <dd>12:00 – 20:00</dd>
                </div>
                <div>
                  <dt>Monday</dt>
                  <dd>A little rest.</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
        <DemoFooter brand="SERA">
          <span className={styles.footerNote}>
            A neighbourhood table. An unhurried evening.
          </span>
        </DemoFooter>
      </div>
      {selected && (
        <ModalPanel
          title={selected.name}
          wide
          onClose={() => setSelected(null)}
        >
          <div className={styles.dishDetail}>
            <Photo
              name={selected.image}
              alt={selected.alt}
              className={styles.detailPhoto}
            />
            <div>
              <p className={styles.eyebrow}>
                {selected.category.toUpperCase()}
                {selected.vegetarian ? " / VEGETARIAN" : ""}
              </p>
              <p className={styles.detailPrice}>£{selected.price}</p>
              <p>{selected.description}</p>
              <h3>What's in the good stuff</h3>
              <p>{selected.ingredients}</p>
              <h3>Sample allergen notes</h3>
              <p>{selected.allergens}</p>
              <p className={styles.small}>
                This is an illustrative dish, not a real menu or dietary
                recommendation.
              </p>
              <button className={styles.primary} onClick={reserve}>
                A table for something good ↗
              </button>
            </div>
          </div>
        </ModalPanel>
      )}
      {booking && (
        <ModalPanel
          title={
            step === 3
              ? "Your evening, imagined."
              : "A table with your name on it."
          }
          onClose={() => setBooking(false)}
        >
          <div
            className={styles.bookingSteps}
            aria-label="Reservation progress"
          >
            <span data-active={step === 1}>01 / YOUR EVENING</span>
            <span data-active={step === 2}>02 / YOUR DETAILS</span>
            <span data-active={step === 3}>03 / ALL SET</span>
          </div>
          {step === 1 && (
            <form
              className={styles.bookingForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (closed || !available(time) || !time) {
                  setBookingError(
                    closed
                      ? "We're closed on Mondays. Try another evening."
                      : "Choose an available time to continue.",
                  );
                  timesContainer.current
                    ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
                    ?.focus();
                  return;
                }
                setBookingError("");
                setStep(2);
              }}
            >
              <p>Pick a day, bring good company, and take your time.</p>
              <div className={styles.formRow}>
                <label>
                  Your evening
                  <input
                    type="date"
                    required
                    min={localToday()}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime("");
                      setBookingError("");
                    }}
                  />
                </label>
                <label>
                  Your party
                  <select
                    value={guests}
                    onChange={(e) => {
                      setGuests(e.target.value);
                      setTime("");
                    }}
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} {i ? "people" : "person"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset className={styles.timeField}>
                <legend>A little time for dinner</legend>
                {!date ? (
                  <p>Choose a date to explore the sample times.</p>
                ) : closed ? (
                  <p role="status">
                    Mondays are our day to rest. Try another evening.
                  </p>
                ) : (
                  <div ref={timesContainer} className={styles.times}>
                    {serviceTimes.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        aria-pressed={time === slot}
                        disabled={!available(slot)}
                        onClick={() => {
                          setTime(slot);
                          setBookingError("");
                        }}
                      >
                        {slot}
                        <small>{available(slot) ? "Available" : "Full"}</small>
                      </button>
                    ))}
                  </div>
                )}
              </fieldset>
              <p className={styles.error} role="alert">
                {bookingError}
              </p>
              <button className={styles.primary}>
                Continue to your details ↗
              </button>
              <small>
                Sample availability. This preview cannot make a real
                reservation.
              </small>
            </form>
          )}
          {step === 2 && (
            <form
              className={styles.bookingForm}
              onSubmit={(e) => {
                e.preventDefault();
                setStep(3);
              }}
            >
              <div className={styles.bookingSummary}>
                <span>{prettyDate(date)}</span>
                <strong>
                  {guests} {Number(guests) === 1 ? "person" : "people"} · {time}
                </strong>
                <button type="button" onClick={() => setStep(1)}>
                  Change evening
                </button>
              </div>
              <label>
                Your name
                <input
                  required
                  minLength={2}
                  autoComplete="name"
                  value={details.name}
                  onChange={(e) =>
                    setDetails((value) => ({ ...value, name: e.target.value }))
                  }
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={details.email}
                  onChange={(e) =>
                    setDetails((value) => ({ ...value, email: e.target.value }))
                  }
                />
              </label>
              <label>
                A note for the table
                <textarea
                  rows={3}
                  placeholder="A celebration, an access requirement, anything you'd like us to know…"
                  value={details.notes}
                  onChange={(e) =>
                    setDetails((value) => ({ ...value, notes: e.target.value }))
                  }
                />
              </label>
              <button className={styles.primary}>
                Preview your reservation ↗
              </button>
              <button
                className={styles.textButton}
                type="button"
                onClick={() => setStep(1)}
              >
                Back to your evening
              </button>
              <small>
                No payment, message or personal information is sent or stored.
              </small>
            </form>
          )}
          {step === 3 && (
            <div className={styles.confirmation}>
              <span aria-hidden="true">✳</span>
              <h3>
                A good evening,
                <br />
                {details.name.split(" ")[0]}.
              </h3>
              <p>
                {prettyDate(date)}
                <br />
                {guests} {Number(guests) === 1 ? "person" : "people"} · {time}
              </p>
              <p>
                Your table preview is ready. No reservation was made and no
                confirmation email was sent.
              </p>
              <button
                className={styles.primary}
                onClick={() => setBooking(false)}
              >
                Back to SERA
              </button>
            </div>
          )}
        </ModalPanel>
      )}
    </article>
  );
}
