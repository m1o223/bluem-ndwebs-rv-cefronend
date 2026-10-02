"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  DemoFooter,
  ModalPanel,
  Photo,
  ProjectNav,
  scrollToSection,
} from "./shared";
import styles from "./photography.module.css";

const photographs = [
  {
    image: "alpine",
    title: "The last light",
    category: "Landscapes",
    location: "Canadian Rockies",
    note: "A still moment between mountain, water and sky.",
    alt: "Sunset touching mountain peaks above a turquoise alpine lake",
  },
  {
    image: "architecture",
    title: "Lines to the sky",
    category: "Architecture",
    location: "The city series",
    note: "Looking up. Finding a different rhythm in familiar places.",
    alt: "Glass skyscrapers photographed from below",
  },
  {
    image: "coast",
    title: "A quieter tide",
    category: "Landscapes",
    location: "Along the coastline",
    note: "The small movements that make an ocean.",
    alt: "Close view of blue ocean waves in soft evening light",
  },
  {
    image: "workspace",
    title: "Room to think",
    category: "Interiors",
    location: "Spaces for living",
    note: "Natural light, warm materials and the spaces in between.",
    alt: "A sunlit studio with a wooden table and large windows",
  },
  {
    image: "forest",
    title: "In good company",
    category: "Landscapes",
    location: "The woodland series",
    note: "An invitation to slow down and look a little closer.",
    alt: "Sunlight streaming through tall forest trees",
  },
  {
    image: "lake",
    title: "Somewhere, slowly",
    category: "Landscapes",
    location: "The alpine journal",
    note: "A journey measured in moments, rather than miles.",
    alt: "A wooden boat pointing toward a clear mountain lake",
  },
];

export default function PhotographyProject() {
  const [category, setCategory] = useState("All work");
  const [selected, setSelected] = useState<number | null>(null);
  const [contact, setContact] = useState(false);
  const [sent, setSent] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const shown = photographs.filter(
    (photo) => category === "All work" || photo.category === category,
  );
  const current = selected === null ? null : photographs[selected];
  function move(direction: number) {
    setSelected((index) =>
      index === null
        ? null
        : (index + direction + photographs.length) % photographs.length,
    );
  }
  function enquire() {
    setSent(false);
    setContact(true);
  }
  return (
    <article
      className={styles.project}
      data-project="photography"
      aria-label="JUNE ATLAS photography portfolio"
    >
      <div data-project-content>
        <ProjectNav
          brand="JUNE ATLAS"
          tagline="PHOTOGRAPHY & VISUAL STORIES"
          links={[
            ["Selected work", "gallery"],
            ["The approach", "about"],
          ]}
          action="Let's talk"
          onAction={enquire}
        />
        <section className={styles.hero} data-section="home">
          <Photo
            name="alpine"
            alt={photographs[0].alt}
            className={styles.heroPhoto}
            sizes="(max-width:700px) 850px, 1600px"
            priority
          />
          <div className={styles.scrim} />
          <div className={styles.heroTop}>
            <span>LANDSCAPE / SPACES / STORIES</span>
            <span>INDEPENDENT VISUAL STUDIO</span>
          </div>
          <div className={styles.heroCopy}>
            <p>LOOK A LITTLE LONGER.</p>
            <h1>
              There is a story
              <br />
              in <em>the stillness.</em>
            </h1>
            <button
              onClick={(e) => scrollToSection(e.currentTarget, "gallery")}
            >
              Explore selected work <span aria-hidden="true">↓</span>
            </button>
          </div>
          <div className={styles.heroBottom}>
            <span>01 — THE LAST LIGHT</span>
            <span>A COLLECTION OF QUIET MOMENTS</span>
          </div>
        </section>
        <section className={styles.gallerySection} data-section="gallery">
          <div className={styles.galleryHeading}>
            <div>
              <p className={styles.eyebrow}>THE SELECTED ARCHIVE / 2026</p>
              <h2>
                Places. Spaces.
                <br />
                <em>Ways of seeing.</em>
              </h2>
            </div>
            <p>
              Images that leave a little space
              <br />
              for your own imagination.
            </p>
          </div>
          <div className={styles.filters} aria-label="Photography categories">
            {["All work", "Landscapes", "Architecture", "Interiors"].map(
              (item) => (
                <button
                  key={item}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                  <small>
                    {item === "All work"
                      ? "06"
                      : `0${photographs.filter((p) => p.category === item).length}`}
                  </small>
                </button>
              ),
            )}
          </div>
          <p className={styles.resultCount} role="status">
            {shown.length} photographs
          </p>
          <div className={styles.gallery}>
            {shown.map((photo, index) => (
              <button
                key={photo.image}
                className={styles.galleryItem}
                data-photo={photo.image}
                data-wide={
                  category === "All work" && (index === 0 || index === 5)
                }
                onClick={() => setSelected(photographs.indexOf(photo))}
                aria-label={`View ${photo.title}`}
              >
                <Photo
                  name={photo.image}
                  alt={photo.alt}
                  className={styles.galleryPhoto}
                />
                <div className={styles.caption}>
                  <div>
                    <h3>{photo.title}</h3>
                    <span>
                      {photo.category} / {photo.location}
                    </span>
                  </div>
                  <span aria-hidden="true">↗</span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className={styles.about} data-section="about">
          <span className={styles.eyebrow}>THE WAY I SEE IT.</span>
          <div>
            <h2>
              Good images don't
              <br />
              shout. <em>They stay.</em>
            </h2>
            <p>
              JUNE ATLAS is a fictional visual studio exploring the relationship
              between people, places and the light that connects them. An
              unhurried approach, an eye for detail, and a curiosity for the
              everyday.
            </p>
            <div className={styles.services}>
              <span>Editorial stories</span>
              <span>Architecture & interiors</span>
              <span>Brand commissions</span>
            </div>
            <button className={styles.outline} onClick={enquire}>
              Let's make something meaningful ↗
            </button>
          </div>
        </section>
        <section className={styles.contactStrip}>
          <p>HAVE A STORY IN MIND?</p>
          <button onClick={enquire}>
            Let's find its light.<span aria-hidden="true">↗</span>
          </button>
          <span>Thoughtful projects. Good conversations.</span>
        </section>
        <DemoFooter brand="JUNE ATLAS">
          <span className={styles.credit}>
            Curated Unsplash imagery · Fictional studio
          </span>
        </DemoFooter>
      </div>
      {current && (
        <ModalPanel
          title={current.title}
          wide
          onClose={() => setSelected(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              e.stopPropagation();
              move(e.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <div className={styles.lightbox}>
            <div
              className={styles.lightboxImage}
              onTouchStart={(e) => {
                touch.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                };
              }}
              onTouchEnd={(e) => {
                if (!touch.current || !e.changedTouches.length) return;
                const dx = e.changedTouches[0].clientX - touch.current.x,
                  dy = e.changedTouches[0].clientY - touch.current.y;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
                  move(dx < 0 ? 1 : -1);
                touch.current = null;
              }}
            >
              <Image
                src={`/images/portfolio/${current.image}.webp`}
                fill
                alt={current.alt}
                sizes="(max-width:700px) 90vw, 1000px"
                quality={90}
              />
            </div>
            <div className={styles.lightboxMeta}>
              <div>
                <p>
                  {current.category} / {current.location}
                </p>
                <span>{current.note}</span>
              </div>
              <div>
                <button
                  aria-label="Previous photograph"
                  onClick={() => move(-1)}
                >
                  ←
                </button>
                <span>{(selected || 0) + 1} / 6</span>
                <button aria-label="Next photograph" onClick={() => move(1)}>
                  →
                </button>
              </div>
            </div>
            <div className={styles.thumbnails}>
              {photographs.map((photo, index) => (
                <button
                  key={photo.image}
                  aria-label={`Open photograph ${index + 1}: ${photo.title}`}
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                >
                  <Photo name={photo.image} alt="" />
                </button>
              ))}
            </div>
            <p className={styles.imageHint}>
              Use the arrows, keyboard ← →, or swipe to explore.
            </p>
          </div>
        </ModalPanel>
      )}
      {contact && (
        <ModalPanel
          title="Let's tell a good story."
          onClose={() => setContact(false)}
        >
          {sent ? (
            <div className={styles.thanks}>
              <p className={styles.eyebrow}>A GOOD START.</p>
              <h3>Your idea has a little more light.</h3>
              <p>
                Your demo enquiry is complete. No message was sent or stored.
              </p>
              <button
                className={styles.outline}
                onClick={() => setContact(false)}
              >
                Back to the archive
              </button>
            </div>
          ) : (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <p>Tell us what you're imagining. A place, a project, a story.</p>
              <label>
                Your name
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
                Project type
                <select name="type">
                  <option>Editorial story</option>
                  <option>Architecture & interiors</option>
                  <option>Brand commission</option>
                  <option>Something else</option>
                </select>
              </label>
              <label>
                A little about your idea
                <textarea name="idea" required minLength={12} rows={4} />
              </label>
              <button className={styles.outline}>Preview enquiry ↗</button>
              <small>
                Fictional studio. This form demonstrates the enquiry experience.
              </small>
            </form>
          )}
        </ModalPanel>
      )}
    </article>
  );
}
