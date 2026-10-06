"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { projects, type ProjectId } from "../portfolio/registry";
import ProductArt from "../portfolio/product-art";
import ConceptReveal from "./concept-reveal";
import {
  templateConceptByProject,
  type CodeTabKey,
} from "./template-concept-data";
import portfolio from "../portfolio/showcase.module.css";
import styles from "./home.module.css";

export default function ProjectShowcase() {
  const [codeCards, setCodeCards] = useState<Set<ProjectId>>(() => new Set());
  const [controlsCards, setControlsCards] = useState<Set<ProjectId>>(() => new Set());
  const [activeTabs, setActiveTabs] = useState<Partial<Record<ProjectId, CodeTabKey>>>({});

  useEffect(() => {
    const resetOnOutsidePointer = (event: PointerEvent) => {
      if ((event.target as HTMLElement | null)?.closest("[data-project-card]")) return;
      resetAllCards();
    };

    document.addEventListener("pointerdown", resetOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", resetOnOutsidePointer);
  }, []);

  const setCardMode = (projectId: ProjectId, showCode: boolean) => {
    setCodeCards(current => {
      const next = new Set(current);
      if (showCode) next.add(projectId);
      else next.delete(projectId);
      return next;
    });
  };

  const setActiveTab = (projectId: ProjectId, tab: CodeTabKey) => {
    setActiveTabs(current => ({ ...current, [projectId]: tab }));
  };

  const revealControls = (projectId: ProjectId) => {
    setControlsCards(current => {
      const next = new Set(current);
      next.add(projectId);
      return next;
    });
  };

  const resetCard = (projectId: ProjectId) => {
    setCardMode(projectId, false);
    setControlsCards(current => {
      const next = new Set(current);
      next.delete(projectId);
      return next;
    });
  };

  const resetAllCards = () => {
    setCodeCards(new Set());
    setControlsCards(new Set());
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
              {(() => {
                const template = templateConceptByProject[project.id];
                const activeTabKey = activeTabs[project.id] || template.codeTabs[0].key;
                const activeTab = template.codeTabs.find((tab) => tab.key === activeTabKey) || template.codeTabs[0];

                return (
              <article
                className={portfolio.card}
                data-project-card={project.id}
                data-flipped={codeCards.has(project.id)}
                data-controls-visible={controlsCards.has(project.id)}
                tabIndex={0}
                aria-label={`${project.brand} concept preview controls`}
                onMouseLeave={() => resetCard(project.id)}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) return;
                  if ((event.target as HTMLElement).closest("a")) return;
                  revealControls(project.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    resetCard(project.id);
                    return;
                  }
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  if (!codeCards.has(project.id)) revealControls(project.id);
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
                        <span>{activeTab.filename}</span>
                        <a
                          className={portfolio.runButton}
                          href={template.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Run ${project.brand} website`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Run Website
                        </a>
                      </div>
                      <div className={portfolio.codePanel}>
                        <div className={portfolio.codeTabs} role="tablist" aria-label={`${project.brand} code files`}>
                          {template.codeTabs.map((tab) => (
                            <button
                              key={tab.key}
                              type="button"
                              role="tab"
                              aria-selected={activeTab.key === tab.key}
                              className={portfolio.codeTab}
                              data-active={activeTab.key === tab.key}
                              onClick={(event) => {
                                event.stopPropagation();
                                setActiveTab(project.id, tab.key);
                              }}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                        <div
                          className={portfolio.codeScroll}
                          onWheel={(event) => event.stopPropagation()}
                          onTouchMove={(event) => event.stopPropagation()}
                        >
                          <pre><code>{activeTab.code.split("\n").map((line, lineIndex) => (
                            <span className={portfolio.codeLine} key={`${project.id}-${activeTab.key}-${lineIndex}`}>
                              <b>{String(lineIndex + 1).padStart(2, "0")}</b>
                              <span>{line || " "}</span>
                            </span>
                          ))}</code></pre>
                        </div>
                        <div className={portfolio.codeFooter}><span><i /> template-specific implementation</span><span>{project.brand}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className={portfolio.modeOverlay} aria-hidden="false">
                    <div className={portfolio.modeActions}>
                      <a
                        className={portfolio.modeButton}
                        href={template.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`View ${project.brand} website`}
                      >
                        View Website
                      </a>
                      <button
                        type="button"
                        className={portfolio.modeButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          setCardMode(project.id, true);
                          setControlsCards(current => {
                            const next = new Set(current);
                            next.delete(project.id);
                            return next;
                          });
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
                );
              })()}
            </ConceptReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
