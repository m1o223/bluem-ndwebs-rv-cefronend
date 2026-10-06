"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [codeCards, setCodeCards] = useState<Set<ProjectId>>(() => new Set());
  const [controlsCards, setControlsCards] = useState<Set<ProjectId>>(() => new Set());

  const setCardMode = (projectId: ProjectId, showCode: boolean) => {
    setCodeCards(current => {
      const next = new Set(current);
      if (showCode) next.add(projectId);
      else next.delete(projectId);
      return next;
    });
  };

  const revealControls = (projectId: ProjectId) => {
    setControlsCards(current => {
      const next = new Set(current);
      next.add(projectId);
      return next;
    });
  };

  const hideControls = (projectId: ProjectId) => {
    setControlsCards(current => {
      const next = new Set(current);
      next.delete(projectId);
      return next;
    });
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
              <article
                className={portfolio.card}
                data-project-card={project.id}
                data-flipped={codeCards.has(project.id)}
                data-controls-visible={controlsCards.has(project.id)}
                tabIndex={0}
                aria-label={`${project.brand} concept preview controls`}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) return;
                  revealControls(project.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    hideControls(project.id);
                    return;
                  }
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  revealControls(project.id);
                }}
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
                  <div className={portfolio.modeOverlay} aria-hidden="false">
                    <div className={portfolio.modeActions}>
                      <button
                        type="button"
                        className={portfolio.modeButton}
                        data-active={!codeCards.has(project.id)}
                        aria-pressed={!codeCards.has(project.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setCardMode(project.id, false);
                          revealControls(project.id);
                        }}
                      >
                        View Page
                      </button>
                      <button
                        type="button"
                        className={portfolio.modeButton}
                        data-active={codeCards.has(project.id)}
                        aria-pressed={codeCards.has(project.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setCardMode(project.id, true);
                          revealControls(project.id);
                        }}
                      >
                        View Code
                      </button>
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
              </article>
            </ConceptReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
