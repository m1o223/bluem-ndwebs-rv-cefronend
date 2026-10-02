"use client";

import { useState } from "react";
import {
  DemoFooter,
  ModalPanel,
  Photo,
  ProjectNav,
  scrollToSection,
} from "./shared";
import styles from "./corporate.module.css";

const services = [
  {
    title: "Business & brand strategy",
    summary: "A clear direction. A shared ambition.",
    body: "We connect the needs of your customers with the ambition of your business. Research, positioning and a practical roadmap give your team a shared direction.",
    tags: ["Research & discovery", "Brand positioning", "Growth roadmaps"],
  },
  {
    title: "Digital transformation",
    summary: "Make the complex feel useful.",
    body: "We help organisations turn disconnected processes into thoughtful digital experiences. Start with the people who use them, prioritise the right problems, and build a plan your team can act on.",
    tags: ["Experience mapping", "Service design", "Digital operations"],
  },
  {
    title: "People & organisational change",
    summary: "Progress starts with people.",
    body: "Meaningful change depends on the people who carry it forward. We bring teams together, clarify responsibilities and create the habits that make a new direction last.",
    tags: ["Leadership alignment", "Team workshops", "Change planning"],
  },
];
const cases = [
  {
    name: "Rowan Workplaces",
    industry: "Workplaces",
    title: "A new chapter for a changing workplace.",
    image: "office",
    alt: "A contemporary office with glass partitions and warm timber",
    brief:
      "Reposition an independent workplace operator around the needs of smaller, more flexible teams.",
    response:
      "Customer interviews informed a focused proposition, a clearer service structure and a phased communication plan.",
    outcomes: [
      "A focused audience definition",
      "One consistent service story",
      "A practical launch roadmap",
    ],
    scope: "Strategy · Positioning · Experience",
  },
  {
    name: "Parallel Systems",
    industry: "Technology",
    title: "Helping a good idea find its next direction.",
    image: "architecture",
    alt: "Modern glass towers against a bright sky",
    brief:
      "Bring a growing software team's product, sales and support functions around a shared customer journey.",
    response:
      "Map the experience from first contact to long-term support, identify the moments that matter and align owners around a prioritised roadmap.",
    outcomes: [
      "A connected customer journey",
      "Clear cross-team responsibilities",
      "A prioritised experience roadmap",
    ],
    scope: "Service design · Digital operations",
  },
  {
    name: "Common Ground",
    industry: "Culture",
    title: "Building a more connected kind of organisation.",
    image: "workspace",
    alt: "A light-filled collaborative workspace",
    brief:
      "Support a small creative organisation as it grows from one close-knit team to a distributed network.",
    response:
      "A series of facilitated workshops shaped a shared set of principles, an onboarding approach and a more useful rhythm of collaboration.",
    outcomes: [
      "Shared working principles",
      "An intentional onboarding plan",
      "A sustainable meeting rhythm",
    ],
    scope: "People · Culture · Change",
  },
];

export default function CorporateProject() {
  const [industry, setIndustry] = useState("All sectors");
  const [selected, setSelected] = useState<(typeof cases)[number] | null>(null);
  const [contact, setContact] = useState(false);
  const [sent, setSent] = useState(false);
  const [enquiryName, setEnquiryName] = useState("");
  function enquire() {
    setSent(false);
    setContact(true);
  }
  const shown = cases.filter(
    (item) => industry === "All sectors" || item.industry === industry,
  );
  return (
    <article
      className={styles.project}
      data-project="corporate"
      aria-label="MERIDIAN business consultancy"
    >
      <div data-project-content>
        <ProjectNav
          brand="MERIDIAN"
          tagline="A CLEARER WAY FORWARD"
          links={[
            ["Our expertise", "expertise"],
            ["Selected cases", "cases"],
            ["Our approach", "approach"],
          ]}
          action="Start a conversation"
          onAction={enquire}
        />
        <section className={styles.hero} data-section="home">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              STRATEGY WITH PURPOSE. PROGRESS WITH PEOPLE.
            </p>
            <h1>
              A clearer
              <br />
              way <span>forward.</span>
            </h1>
            <p>
              We help ambitious organisations find their direction, bring their
              people together and make meaningful progress.
            </p>
            <button
              className={styles.primary}
              onClick={(e) => scrollToSection(e.currentTarget, "expertise")}
            >
              Explore our expertise <span aria-hidden="true">↗</span>
            </button>
            <span className={styles.heroFoot}>
              INDEPENDENT THINKING. CONNECTED EXPERTISE.
            </span>
          </div>
          <div className={styles.heroVisual}>
            <Photo
              name="architecture"
              alt="Contemporary architecture reaching into an open sky"
              className={styles.heroPhoto}
              priority
            />
            <div className={styles.visualLabel}>
              <span>NEW PERSPECTIVES.</span>
              <strong>
                Better questions.
                <br />
                Better possibilities.
              </strong>
              <span aria-hidden="true">↗</span>
            </div>
          </div>
        </section>
        <div className={styles.principles}>
          <span>Clear thinking.</span>
          <span>Shared ambition.</span>
          <span>Lasting progress.</span>
        </div>
        <section className={styles.expertise} data-section="expertise">
          <div>
            <p className={styles.eyebrow}>CONNECTED EXPERTISE / 01</p>
            <h2>
              The right thinking.
              <br />
              At the right moment.
            </h2>
            <p>
              No two organisations need the same answer. We bring the right
              perspectives together around the questions that matter to you.
            </p>
          </div>
          <div className={styles.accordions}>
            {services.map((item, i) => (
              <details key={item.title} open={i === 0 ? true : undefined}>
                <summary>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </div>
                  <b aria-hidden="true">+</b>
                </summary>
                <div className={styles.serviceBody}>
                  <p>{item.body}</p>
                  <ul>
                    {item.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <button onClick={enquire}>
                    Talk about {item.title.toLowerCase()} ↗
                  </button>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className={styles.cases} data-section="cases">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>PERSPECTIVE IN PRACTICE / 02</p>
              <h2>
                Progress looks
                <br />
                different for everyone.
              </h2>
            </div>
            <p>
              Three illustrative engagements.
              <br />
              One considered approach.
            </p>
          </div>
          <div className={styles.filters} aria-label="Case study sectors">
            {["All sectors", "Workplaces", "Technology", "Culture"].map(
              (item) => (
                <button
                  key={item}
                  aria-pressed={industry === item}
                  onClick={() => setIndustry(item)}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <div className={styles.caseGrid}>
            {shown.map((item) => (
              <button
                className={styles.caseCard}
                key={item.name}
                data-case={item.name}
                onClick={() => setSelected(item)}
                aria-label={`Read ${item.name} case study`}
              >
                <Photo
                  name={item.image}
                  alt={item.alt}
                  className={styles.casePhoto}
                />
                <div>
                  <p>
                    {item.industry.toUpperCase()} / {item.name}
                  </p>
                  <h3>{item.title}</h3>
                  <span>
                    Explore the case <b aria-hidden="true">↗</b>
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className={styles.demoNote}>
            Fictional engagements created to demonstrate the MERIDIAN
            experience.
          </p>
        </section>
        <section className={styles.approach} data-section="approach">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>A SHARED PATH / 03</p>
              <h2>
                From good questions
                <br />
                to meaningful action.
              </h2>
            </div>
            <p>
              Close collaboration.
              <br />
              Clear decisions. Realistic next steps.
            </p>
          </div>
          <div className={styles.steps}>
            {[
              [
                "Listen",
                "Understand the organisation, its people and the challenge ahead.",
              ],
              [
                "Connect",
                "Bring different perspectives around a shared ambition.",
              ],
              [
                "Shape",
                "Turn insight into a focused, practical plan of action.",
              ],
              [
                "Move",
                "Support the team as they take the next step and learn.",
              ],
            ].map(([name, text], i) => (
              <div key={name}>
                <span>0{i + 1}</span>
                <h3>{name}.</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.cta}>
          <p className={styles.eyebrow}>WHAT'S YOUR NEXT CHAPTER?</p>
          <h2>Let's find a way forward.</h2>
          <button className={styles.primary} onClick={enquire}>
            Start a conversation <span aria-hidden="true">↗</span>
          </button>
        </section>
        <DemoFooter brand="MERIDIAN">
          <span className={styles.footerLine}>
            Independent perspective. Shared progress.
          </span>
        </DemoFooter>
      </div>
      {selected && (
        <ModalPanel
          title={selected.name}
          wide
          onClose={() => setSelected(null)}
        >
          <Photo
            name={selected.image}
            alt={selected.alt}
            className={styles.detailPhoto}
          />
          <div className={styles.caseDetail}>
            <div>
              <p className={styles.eyebrow}>
                {selected.industry.toUpperCase()} / ILLUSTRATIVE ENGAGEMENT
              </p>
              <h3>{selected.title}</h3>
              <span>{selected.scope}</span>
            </div>
            <div>
              <h4>The question</h4>
              <p>{selected.brief}</p>
              <h4>The approach</h4>
              <p>{selected.response}</p>
              <h4>The intended outcomes</h4>
              <ul>
                {selected.outcomes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            className={styles.primary}
            onClick={() => {
              setSelected(null);
              enquire();
            }}
          >
            Discuss a similar challenge ↗
          </button>
        </ModalPanel>
      )}
      {contact && (
        <ModalPanel
          title="A good conversation starts here."
          onClose={() => setContact(false)}
        >
          {sent ? (
            <div className={styles.thanks}>
              <span className={styles.eyebrow}>YOUR NEXT STEP</span>
              <h3>Thank you, {enquiryName}.</h3>
              <p>
                Your demo enquiry is complete. No information was submitted or
                stored.
              </p>
              <button
                className={styles.primary}
                onClick={() => setContact(false)}
              >
                Back to MERIDIAN
              </button>
            </div>
          ) : (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                setEnquiryName(
                  String(new FormData(e.currentTarget).get("name")).split(
                    " ",
                  )[0],
                );
                setSent(true);
              }}
            >
              <p>
                Tell us a little about your organisation and the question you're
                working on.
              </p>
              <div className={styles.formRow}>
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </label>
                <label>
                  Work email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </label>
              </div>
              <label>
                Organisation
                <input
                  name="company"
                  required
                  minLength={2}
                  autoComplete="organization"
                />
              </label>
              <label>
                Area of interest
                <select name="interest">
                  {services.map((item) => (
                    <option key={item.title}>{item.title}</option>
                  ))}
                  <option>Let's work it out together</option>
                </select>
              </label>
              <label>
                Your challenge
                <textarea name="message" required minLength={15} rows={4} />
              </label>
              <label className={styles.checkbox}>
                <input type="checkbox" required /> I understand this is a
                demonstration enquiry.
              </label>
              <button className={styles.primary}>Preview enquiry ↗</button>
              <small>
                No message is sent. Your details stay in this preview session.
              </small>
            </form>
          )}
        </ModalPanel>
      )}
    </article>
  );
}
