"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { templateConceptByProject } from "./template-concept-data";
import { projects } from "../portfolio/registry";
import ProductArt from "../portfolio/product-art";
import ConceptReveal from "./concept-reveal";
import portfolio from "../portfolio/showcase.module.css";
import styles from "./home.module.css";
import InteractiveProjectViewer from "./project-viewer";

export default function ProjectShowcase({ headingAs: Heading = "h2" }: { headingAs?: "h1" | "h2" }) {
  const [activeProject, setActiveProject] = useState<(typeof projects)[number]["id"] | null>(null);

  return (
    <>
      <section
      id="selected-work"
      className={styles.showcase}
      aria-labelledby="work-title"
    >
      <div className={styles.container}>
        <ConceptReveal direction="up">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>INTERACTIVE DEMOS</p>
              <Heading id="work-title">Website Concepts</Heading>
            </div>
            <p>
              Explore original, interactive website concepts across different
              industries.
            </p>
          </div>
          <p className={portfolio.disclosure}>Demo concepts by BlueMind Web Service.</p>
        </ConceptReveal>
        <div className={portfolio.grid}>
          {projects.map((project, index) => (
            <ConceptReveal
              key={project.id}
              direction={index % 2 === 0 ? "right" : "left"}
              stagger={index % 2 === 1}
            >
              <Link
                className={portfolio.card}
                data-project-card={project.id}
                href={templateConceptByProject[project.id].liveUrl}
                aria-haspopup="dialog"
                aria-label={`Preview Website: ${project.brand}, ${project.category}`}
                onClick={(event) => {
                  event.preventDefault();
                  setActiveProject(project.id);
                }}
              >
                <div className={portfolio.toolbar}>
                  <span className={portfolio.dots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>
                    {project.brand.toLowerCase()} —{" "}
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
                        <span>✳</span>
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
                  <span className={portfolio.cardCta} data-demo-cta>
                    Preview
                  </span>
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
              </Link>
            </ConceptReveal>
          ))}
        </div>
      </div>
      </section>
      {activeProject && (
        <InteractiveProjectViewer
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </>
  );
}
