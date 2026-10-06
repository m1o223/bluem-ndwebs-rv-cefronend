import type { ComponentType } from "react";
import AIPlatformProject from "../../../components/portfolio/ai-platform";
import CorporateProject from "../../../components/portfolio/corporate";
import EcommerceProject from "../../../components/portfolio/ecommerce";
import FurnitureProject from "../../../components/portfolio/furniture";
import PhotographyProject from "../../../components/portfolio/photography";
import RealEstateProject from "../../../components/portfolio/real-estate";
import RestaurantProject from "../../../components/portfolio/restaurant";
import { ProjectViewport } from "../../../components/portfolio/shared";
import {
  templateConceptBySlug,
  templateConceptDetails,
} from "../../../components/home/template-concept-data";
import type { ProjectId } from "../../../components/portfolio/registry";
import styles from "./template-page.module.css";

const projectComponents: Record<ProjectId, ComponentType> = {
  ecommerce: EcommerceProject,
  "ai-platform": AIPlatformProject,
  photography: PhotographyProject,
  corporate: CorporateProject,
  furniture: FurnitureProject,
  "real-estate": RealEstateProject,
  restaurant: RestaurantProject,
};

export function generateStaticParams() {
  return templateConceptDetails.map((template) => ({ slug: template.slug }));
}

export default async function TemplateDemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = templateConceptBySlug[slug];

  if (!template) {
    return (
      <main className={styles.notFound}>
        <div>
          <h1>Template not found</h1>
          <p>This BlueMind concept is not available.</p>
        </div>
      </main>
    );
  }

  const Project = projectComponents[template.projectId];

  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <ProjectViewport>
          <Project />
        </ProjectViewport>
      </div>
    </main>
  );
}
