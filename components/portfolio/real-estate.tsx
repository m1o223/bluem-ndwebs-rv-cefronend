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
import styles from "./real-estate.module.css";

const homes = [
  {
    id: "garden",
    title: "The Garden House",
    city: "Bath",
    area: "Westbrook Lane",
    price: 690000,
    beds: 3,
    baths: 2,
    size: 180,
    type: "Detached home",
    image: "house",
    alt: "A contemporary house surrounded by mature trees",
    photos: ["house", "interior", "kitchen"],
    description:
      "A thoughtfully arranged family home with open living spaces, generous glazing and a garden that feels like an extension of the indoors.",
    features: [
      "Private garden",
      "Open-plan living",
      "Dedicated study",
      "Off-street parking",
    ],
  },
  {
    id: "courtyard",
    title: "Courtyard Residence",
    city: "Bristol",
    area: "Oakfield Quarter",
    price: 485000,
    beds: 2,
    baths: 1,
    size: 115,
    type: "Townhouse",
    image: "cottage",
    alt: "A modern townhouse with a warmly lit entrance",
    photos: ["cottage", "living-room", "workspace"],
    description:
      "An easy-going city home with a quiet courtyard, characterful rooms and space to make your own. Close to the everyday, a little removed from the rush.",
    features: [
      "Private courtyard",
      "Flexible living space",
      "Walkable neighbourhood",
      "Built-in storage",
    ],
  },
  {
    id: "riverside",
    title: "Riverside Loft",
    city: "Bath",
    area: "The Riverside",
    price: 425000,
    beds: 2,
    baths: 2,
    size: 110,
    type: "Apartment",
    image: "interior",
    alt: "An open contemporary interior with pale furniture and timber details",
    photos: ["interior", "kitchen", "living-room"],
    description:
      "Light, space and a fresh perspective on city living. An open-plan apartment with natural finishes and a comfortable rhythm from morning to evening.",
    features: [
      "Open-plan layout",
      "Large windows",
      "Lift access",
      "Secure entry",
    ],
  },
  {
    id: "light",
    title: "The Light House",
    city: "Oxford",
    area: "Northwood Park",
    price: 845000,
    beds: 4,
    baths: 3,
    size: 240,
    type: "Family home",
    image: "kitchen",
    alt: "A spacious light-filled home with an open stair and blue seating",
    photos: ["kitchen", "house", "interior"],
    description:
      "A generous home designed around the way a family lives. Connected social spaces, quieter corners and thoughtful details throughout.",
    features: [
      "Four bedrooms",
      "Flexible family room",
      "Landscaped garden",
      "Utility room",
    ],
  },
];
type Home = (typeof homes)[number];
type Filters = { city: string; beds: string; budget: string };
const defaults: Filters = {
  city: "Anywhere",
  beds: "Any",
  budget: "Any budget",
};
const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

function FilterFields({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
}) {
  return (
    <>
      <label>
        Location
        <select
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        >
          {["Anywhere", "Bath", "Bristol", "Oxford"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        Bedrooms
        <select
          value={value.beds}
          onChange={(e) => onChange({ ...value, beds: e.target.value })}
        >
          {["Any", "2+", "3+", "4+"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        Maximum price
        <select
          value={value.budget}
          onChange={(e) => onChange({ ...value, budget: e.target.value })}
        >
          <option>Any budget</option>
          <option value="500000">£500,000</option>
          <option value="750000">£750,000</option>
          <option value="1000000">£1,000,000</option>
        </select>
      </label>
    </>
  );
}
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export default function RealEstateProject() {
  const [draftFilters, setDraftFilters] = useState<Filters>(defaults);
  const [filters, setFilters] = useState<Filters>(defaults);
  const [sort, setSort] = useState("Selected homes");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<Home | null>(null);
  const [photo, setPhoto] = useState(0);
  const [panel, setPanel] = useState<
    "filters" | "enquiry" | "confirmation" | null
  >(null);
  const [enquiryHome, setEnquiryHome] = useState<Home | null>(null);
  const [confirmation, setConfirmation] = useState({
    name: "",
    date: "",
    time: "",
  });
  const shown = homes
    .filter(
      (home) =>
        (!savedOnly || saved.includes(home.id)) &&
        (filters.city === "Anywhere" || home.city === filters.city) &&
        (filters.beds === "Any" || home.beds >= parseInt(filters.beds)) &&
        (filters.budget === "Any budget" ||
          home.price <= Number(filters.budget)),
    )
    .sort((a, b) =>
      sort === "Price: low to high"
        ? a.price - b.price
        : sort === "Price: high to low"
          ? b.price - a.price
          : homes.indexOf(a) - homes.indexOf(b),
    );
  const filterCount =
    Number(filters.city !== defaults.city) +
    Number(filters.beds !== defaults.beds) +
    Number(filters.budget !== defaults.budget);
  function toggleSaved(id: string) {
    setSaved((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  }
  function openHome(home: Home) {
    setSelected(home);
    setPhoto(0);
  }
  function enquire(home: Home | null) {
    setEnquiryHome(home);
    setSelected(null);
    setPanel("enquiry");
  }
  function reset() {
    setFilters(defaults);
    setDraftFilters(defaults);
    setSavedOnly(false);
  }
  function openFilters() {
    setDraftFilters(filters);
    setPanel("filters");
  }
  return (
    <article
      className={styles.project}
      data-project="real-estate"
      aria-label="HAVEN property search"
    >
      <div data-project-content>
        <ProjectNav
          brand="HAVEN"
          tagline="HOMES WITH A LITTLE MORE FEELING"
          links={[
            ["Find a home", "homes"],
            ["Our perspective", "perspective"],
            ["Meet your guide", "team"],
          ]}
          action={`Saved (${saved.length})`}
          onAction={(e) => {
            setSavedOnly(true);
            scrollToSection(e.currentTarget, "homes");
          }}
        />
        <section className={styles.hero} data-section="home">
          <Photo
            name="house"
            alt="A contemporary home opening onto a green garden"
            className={styles.heroPhoto}
            sizes="(max-width:700px) 1000px, 1800px"
            priority
          />
          <div className={styles.scrim} />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A PLACE TO CALL YOUR OWN.</p>
            <h1>
              Find a home.
              <br />
              <em>Feel at home.</em>
            </h1>
            <p>
              Thoughtfully selected homes. A more personal way to find your next
              chapter.
            </p>
            <button
              className={styles.heroButton}
              onClick={(e) => scrollToSection(e.currentTarget, "homes")}
            >
              Explore the homes <span aria-hidden="true">↗</span>
            </button>
          </div>
          <span className={styles.heroCaption}>
            GOOD HOMES. GOOD NEIGHBOURHOODS. GOOD BEGINNINGS.
          </span>
        </section>
        <form
          className={styles.searchBar}
          aria-label="Property search"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters(draftFilters);
            setSavedOnly(false);
            scrollToSection(e.currentTarget, "homes");
          }}
        >
          <FilterFields value={draftFilters} onChange={setDraftFilters} />
          <button className={styles.primary}>Find my home ↗</button>
        </form>
        <section className={styles.homes} data-section="homes">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>THE CONSIDERED COLLECTION</p>
              <h2>
                A good place
                <br />
                to <em>begin.</em>
              </h2>
            </div>
            <p>
              Spaces with character.
              <br />
              Homes with possibilities.
            </p>
          </div>
          <div className={styles.listTools}>
            <div className={styles.listTabs}>
              <button
                aria-pressed={!savedOnly}
                onClick={() => setSavedOnly(false)}
              >
                All homes
              </button>
              <button
                aria-pressed={savedOnly}
                onClick={() => setSavedOnly(true)}
              >
                Saved homes ({saved.length})
              </button>
            </div>
            <div>
              <button className={styles.mobileFilter} onClick={openFilters}>
                Filters{filterCount ? ` (${filterCount})` : ""}
              </button>
              <label>
                Sort homes
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option>Selected homes</option>
                  <option>Price: low to high</option>
                  <option>Price: high to low</option>
                </select>
              </label>
            </div>
          </div>
          <div className={styles.results}>
            <span role="status">
              {shown.length} {shown.length === 1 ? "home" : "homes"}
              {filterCount ? " matching your search" : " to discover"}
            </span>
            {filterCount > 0 && <button onClick={reset}>Clear filters</button>}
          </div>
          <div className={styles.propertyGrid}>
            {shown.map((home) => (
              <div
                className={styles.property}
                key={home.id}
                data-property={home.id}
              >
                <div className={styles.propertyImage}>
                  <button
                    onClick={() => openHome(home)}
                    aria-label={`View ${home.title}`}
                  >
                    <Photo
                      name={home.image}
                      alt={home.alt}
                      className={styles.propertyPhoto}
                    />
                  </button>
                  <span>{home.type}</span>
                  <button
                    className={styles.save}
                    aria-label={`${saved.includes(home.id) ? "Unsave" : "Save"} ${home.title}`}
                    aria-pressed={saved.includes(home.id)}
                    onClick={() => toggleSaved(home.id)}
                  >
                    <Heart filled={saved.includes(home.id)} />
                  </button>
                </div>
                <div className={styles.propertyCopy}>
                  <p>
                    {home.area} / {home.city}
                  </p>
                  <button
                    className={styles.propertyTitle}
                    onClick={() => openHome(home)}
                  >
                    {home.title}
                    <span aria-hidden="true">↗</span>
                  </button>
                  <strong>{money(home.price)}</strong>
                  <div className={styles.specs}>
                    <span>{home.beds} bedrooms</span>
                    <span>{home.baths} bathrooms</span>
                    <span>{home.size} m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {shown.length === 0 && (
            <div className={styles.empty}>
              <h3>
                {savedOnly
                  ? "Your next home is out there."
                  : "A little more room to search."}
              </h3>
              <p>
                {savedOnly
                  ? "Save a home you love, or adjust your filters to see your collection."
                  : "No homes match this combination. Try another location, budget or bedroom count."}
              </p>
              <button className={styles.primary} onClick={reset}>
                Explore all homes
              </button>
            </div>
          )}
          <p className={styles.demoNote}>
            Illustrative listings and photography. These properties are not
            offered for sale.
          </p>
        </section>
        <section className={styles.perspective} data-section="perspective">
          <div>
            <p className={styles.eyebrow}>MORE THAN THE RIGHT ADDRESS.</p>
            <h2>
              A home is a feeling.
              <br />
              <em>We start there.</em>
            </h2>
            <p>
              Room to grow. Space to slow down. A neighbourhood that feels like
              you. We look beyond the floor plan to help you find a home that
              fits the way you want to live.
            </p>
            <div>
              <span>Considered selection</span>
              <span>Personal guidance</span>
              <span>A clearer journey</span>
            </div>
          </div>
          <Photo
            name="living-room"
            alt="A welcoming living room with natural light and warm materials"
            className={styles.perspectivePhoto}
          />
        </section>
        <section className={styles.team} data-section="team">
          <div>
            <p className={styles.eyebrow}>YOUR NEXT CHAPTER, TOGETHER.</p>
            <h2>
              A good home.
              <br />A good conversation.
            </h2>
            <p>
              Your HAVEN guide can help you make sense of the options and decide
              on your next step.
            </p>
          </div>
          <div className={styles.agent}>
            <span className={styles.initials}>EH</span>
            <div>
              <h3>Ellis Harper</h3>
              <span>Your fictional home guide</span>
              <p>
                Thoughtful advice, from the first question to the next chapter.
              </p>
              <button className={styles.primary} onClick={() => enquire(null)}>
                Talk to your guide ↗
              </button>
            </div>
          </div>
        </section>
        <DemoFooter brand="HAVEN">
          <span className={styles.footerNote}>A more considered move.</span>
        </DemoFooter>
      </div>
      {selected && (
        <ModalPanel
          title={selected.title}
          wide
          onClose={() => setSelected(null)}
        >
          <Photo
            name={selected.photos[photo]}
            alt={`Illustrative photograph ${photo + 1} for ${selected.title}`}
            className={styles.detailPhoto}
          />
          <div className={styles.galleryControls}>
            <button
              aria-label="Previous property photo"
              onClick={() => setPhoto((p) => (p + 2) % 3)}
            >
              ←
            </button>
            <span>{photo + 1} / 3 · Illustrative gallery</span>
            <button
              aria-label="Next property photo"
              onClick={() => setPhoto((p) => (p + 1) % 3)}
            >
              →
            </button>
          </div>
          <div className={styles.propertyDetail}>
            <div>
              <p className={styles.eyebrow}>
                {selected.area.toUpperCase()} / {selected.city.toUpperCase()}
              </p>
              <h3>{money(selected.price)}</h3>
              <p>{selected.description}</p>
              <button
                className={styles.outline}
                aria-pressed={saved.includes(selected.id)}
                onClick={() => toggleSaved(selected.id)}
              >
                <Heart filled={saved.includes(selected.id)} />
                {saved.includes(selected.id)
                  ? "Saved to your collection"
                  : "Save this home"}
              </button>
            </div>
            <div>
              <dl className={styles.detailSpecs}>
                <div>
                  <dt>Bedrooms</dt>
                  <dd>{selected.beds}</dd>
                </div>
                <div>
                  <dt>Bathrooms</dt>
                  <dd>{selected.baths}</dd>
                </div>
                <div>
                  <dt>Floor area</dt>
                  <dd>{selected.size} m²</dd>
                </div>
                <div>
                  <dt>Property type</dt>
                  <dd>{selected.type}</dd>
                </div>
              </dl>
              <h4>Worth coming home to</h4>
              <ul>
                {selected.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button
                className={styles.primary}
                onClick={() => enquire(selected)}
              >
                Arrange a viewing ↗
              </button>
            </div>
          </div>
        </ModalPanel>
      )}
      {panel && (
        <ModalPanel
          title={
            panel === "filters"
              ? "Find your kind of home."
              : panel === "enquiry"
                ? enquiryHome
                  ? `A closer look at ${enquiryHome.title}`
                  : "Let's find your next chapter."
                : "A good next step."
          }
          onClose={() => setPanel(null)}
        >
          {panel === "filters" && (
            <form
              className={styles.filterForm}
              onSubmit={(e) => {
                e.preventDefault();
                setFilters(draftFilters);
                setPanel(null);
              }}
            >
              <FilterFields value={draftFilters} onChange={setDraftFilters} />
              <button className={styles.primary}>Show matching homes</button>
              <button
                className={styles.outline}
                type="button"
                onClick={() => setDraftFilters(defaults)}
              >
                Reset search
              </button>
            </form>
          )}
          {panel === "enquiry" && (
            <form
              className={styles.enquiry}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                setConfirmation({
                  name: String(data.get("name")).split(" ")[0],
                  date: String(data.get("date")),
                  time: String(data.get("time")),
                });
                setPanel("confirmation");
              }}
            >
              <p>
                {enquiryHome
                  ? `${enquiryHome.title} · ${enquiryHome.city} · ${money(enquiryHome.price)}`
                  : "Tell us a little about the home you're looking for."}
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
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Early evening</option>
                  </select>
                </label>
              </div>
              <label>
                Your questions
                <textarea
                  name="questions"
                  rows={3}
                  placeholder="Anything you'd like us to know?"
                />
              </label>
              <button className={styles.primary}>
                Preview viewing enquiry ↗
              </button>
              <small>
                Sample viewing preferences. No enquiry is sent or appointment
                booked.
              </small>
            </form>
          )}
          {panel === "confirmation" && (
            <div className={styles.empty}>
              <p className={styles.eyebrow}>YOUR NEXT CHAPTER</p>
              <h3>Thank you, {confirmation.name}.</h3>
              <p>
                {enquiryHome?.title || "Your home search"}
                <br />
                {confirmation.date} · {confirmation.time}
              </p>
              <p>
                Your demo enquiry is complete. No viewing has been booked and no
                personal information was stored.
              </p>
              <button className={styles.primary} onClick={() => setPanel(null)}>
                Back to the homes
              </button>
            </div>
          )}
        </ModalPanel>
      )}
    </article>
  );
}
