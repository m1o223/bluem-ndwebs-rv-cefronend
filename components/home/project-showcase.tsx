"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import InteractiveProjectViewer, {
  type ProjectViewerHandle,
} from "./project-viewer";
import { projects, type ProjectId } from "../portfolio/registry";
import ProductArt from "../portfolio/product-art";
import ConceptReveal from "./concept-reveal";
import portfolio from "../portfolio/showcase.module.css";
import styles from "./home.module.css";

export default function ProjectShowcase() {
  const viewer = useRef<ProjectViewerHandle>(null);
  const [selected, setSelected] = useState<ProjectId | null>(null);
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
                onClick={(event) => {
                  event.currentTarget.focus({ preventScroll: true });
                  if (selected === project.id) viewer.current?.restore();
                  else setSelected(project.id);
                }}
                aria-haspopup="dialog"
                aria-label={`View Demo: ${project.brand}, ${project.category}`}
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
                  <span className={portfolio.hoverOverlay} aria-hidden="true">
                    <span className={portfolio.cardCta} data-demo-cta>
                      View Demo
                    </span>
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
