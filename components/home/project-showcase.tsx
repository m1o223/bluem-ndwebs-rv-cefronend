"use client";

import Image from "next/image";
import { useState } from "react";
import InteractiveProjectViewer from "./project-viewer";
import { projects, type ProjectId } from "../portfolio/registry";
import ProductArt from "../portfolio/product-art";
import portfolio from "../portfolio/showcase.module.css";
import styles from "./home.module.css";

export default function ProjectShowcase() {
  const [selected, setSelected] = useState<ProjectId | null>(null);
  return (
    <section
      id="selected-work"
      className={styles.showcase}
      aria-labelledby="work-title"
    >
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>DESIGN IN ACTION</p>
            <h2 id="work-title">
              Selected work<span className={styles.bluePeriod}>.</span>
            </h2>
          </div>
          <p>
            Explore some of the digital
            <br className={styles.desktopBreak} /> experiences we build.
          </p>
        </div>
        <div className={portfolio.grid}>
          {projects.map((project) => (
            <button
              key={project.id}
              className={portfolio.card}
              data-project-card={project.id}
              onClick={() => setSelected(project.id)}
              aria-haspopup="dialog"
              aria-label={`Explore ${project.brand} ${project.category} project`}
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
                <span aria-hidden="true">↗</span>
              </div>
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
                  <div className={portfolio.miniButton}>Step inside</div>
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
              <div className={portfolio.caption}>
                <div>
                  <strong>{project.brand}</strong>
                  <p>{project.description}</p>
                </div>
                <span aria-hidden="true">↗</span>
              </div>
            </button>
          ))}
        </div>
        <p className={portfolio.hint}>
          Fictional projects. Real interfaces. Open a concept to explore its
          interactions.
        </p>
      </div>
      <InteractiveProjectViewer
        project={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
