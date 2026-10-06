"use client";

import Image from "next/image";
import { type TouchEvent, useRef, useState } from "react";
import InteractiveProjectViewer, {
  type ProjectViewerHandle,
} from "./project-viewer";
import { projects, type ProjectId } from "../portfolio/registry";
import ProductArt from "../portfolio/product-art";
import ConceptReveal from "./concept-reveal";
import portfolio from "../portfolio/showcase.module.css";
import styles from "./home.module.css";

type Project = (typeof projects)[number];

function conceptCodeLines(project: Project) {
  const componentName = project.brand.replace(/[^a-z]/gi, "") || "Concept";
  return [
    `const ${componentName}Preview = () => (`,
    `  <WebsiteShell brand="${project.brand}">`,
    `    <Hero category="${project.category}" />`,
    `    <Headline>${project.title}</Headline>`,
    "    <ResponsivePreview motion />",
    "  </WebsiteShell>",
    ");",
  ];
}

export default function ProjectShowcase() {
  const viewer = useRef<ProjectViewerHandle>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<ProjectId | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<ProjectId>>(() => new Set());

  const toggleTouchFlip = (projectId: ProjectId) => {
    setFlippedCards(current => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const shouldUseTapFlip = () =>
    window.innerWidth <= 700 || window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const handleTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLButtonElement>, projectId: ProjectId) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;

    const moved = Math.hypot(touch.clientX - start.x, touch.clientY - start.y);
    if (moved > 12) return;

    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    toggleTouchFlip(projectId);
  };

  return (
    <section
      id="selected-work"
      className={`${styles.showcase} ${portfolio.revealSection}`}
      aria-labelledby="work-title"
    >
      <div className={styles.container}>
        <ConceptReveal direction="up">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>INTERACTIVE DEMOS</p>
              <h2 id="work-title">Website Concepts</h2>
            </div>
            <p>
              Explore original, interactive website concepts across different
              industries.
            </p>
          </div>
          <p className={portfolio.disclosure}>
            Fictional demo brands created by BlueMind Web Service.
            <br />
            Not commissioned client projects.
          </p>
        </ConceptReveal>
        <div className={portfolio.grid}>
          {projects.map((project, index) => (
            <ConceptReveal
              key={project.id}
              direction={index % 2 === 0 ? "right" : "left"}
              stagger={index % 2 === 1}
            >
              <button
                className={portfolio.card}
                data-project-card={project.id}
                data-flipped={flippedCards.has(project.id)}
                onTouchStart={handleTouchStart}
                onTouchEnd={(event) => handleTouchEnd(event, project.id)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  toggleTouchFlip(project.id);
                }}
                onClick={(event) => {
                  event.currentTarget.focus({ preventScroll: true });
                  if (shouldUseTapFlip()) {
                    toggleTouchFlip(project.id);
                    return;
                  }
                  if (selected === project.id) viewer.current?.restore();
                  else setSelected(project.id);
                }}
                aria-haspopup="dialog"
                aria-label={`View Demo: ${project.brand}, ${project.category}`}
              >
                <div className={portfolio.flipStage}>
                  <div className={portfolio.flipInner}>
                    <div className={`${portfolio.flipFace} ${portfolio.flipFront}`}>
                      <div className={portfolio.toolbar}>
                        <span className={portfolio.dots} aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span>
                          {project.brand.toLowerCase()} -{" "}
                          {project.category.toLowerCase()}
                        </span>
                      </div>
                      <div className={portfolio.previewShell}>
                        <div
                          className={portfolio.preview}
                          data-preview={project.id}
                          style={{ background: project.color, color: project.ink }}
                        >
                          <div className={portfolio.previewNav}>
                            <span>{project.brand}</span>
                            <span>Explore &nbsp; About &nbsp; Contact</span>
                          </div>
                          <div className={portfolio.previewCopy}>
                            <span>{project.category.toUpperCase()}</span>
                            <h3>{project.title}</h3>
                          </div>
                          {project.id === "ai-platform" && (
                            <div className={portfolio.aiMini} aria-hidden="true">
                              <span>*</span>
                              <div>
                                <i />
                                <i />
                                <i />
                              </div>
                              <small>
                                A little spark.
                                <br />A clearer first draft.
                              </small>
                            </div>
                          )}
                          {project.id === "ecommerce" ? (
                            <div className={portfolio.productArt}>
                              <ProductArt />
                            </div>
                          ) : (
                            project.image && (
                              <div className={portfolio.previewPhoto}>
                                <Image
                                  src={`/images/portfolio/${project.image}.webp`}
                                  fill
                                  alt=""
                                  sizes="(max-width:700px) 80vw, 500px"
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`${portfolio.flipFace} ${portfolio.flipBack}`}>
                      <div className={portfolio.codeToolbar}>
                        <span className={portfolio.dots} aria-hidden="true"><i /><i /><i /></span>
                        <span>{project.brand.toLowerCase()}-preview.tsx</span>
                        <i>TSX</i>
                      </div>
                      <div className={portfolio.codePanel}>
                        <div className={portfolio.codeTabs}><span>React</span><span>Next.js</span><span>CSS Modules</span></div>
                        <pre><code>{conceptCodeLines(project).map((line, lineIndex) => (
                          <span className={portfolio.codeLine} key={`${project.id}-${lineIndex}`}>
                            <b>{String(lineIndex + 1).padStart(2, "0")}</b>
                            <span>{line}</span>
                          </span>
                        ))}</code></pre>
                        <div className={portfolio.codeFooter}><span><i /> component architecture</span><span>responsive</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={portfolio.caption}>
                  <div>
                    <strong>{project.brand}</strong>
                    <span className={portfolio.category}>
                      {project.category}
                    </span>
                    <p>{project.description}</p>
                  </div>
                </div>
              </button>
            </ConceptReveal>
          ))}
        </div>
      </div>
      {selected && (
        <InteractiveProjectViewer
          ref={viewer}
          key={selected}
          project={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
