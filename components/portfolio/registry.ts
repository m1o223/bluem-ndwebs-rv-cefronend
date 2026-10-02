import dynamic from "next/dynamic";
import ProjectLoading from "../home/project-loading";

export const projects = [
  {
    id: "ecommerce",
    brand: "MORROW",
    category: "E-Commerce Concept",
    title: "Good skin. Simple days.",
    description: "A considered skincare store, from discovery to checkout.",
    color: "#dce5d4",
    ink: "#30472e",
    image: null,
  },
  {
    id: "ai-platform",
    brand: "ASTER",
    category: "AI Platform Concept",
    title: "Space for your ideas.",
    description:
      "A thoughtful writing workspace that turns a spark into a first draft.",
    color: "#eee8f7",
    ink: "#675389",
    image: null,
  },
  {
    id: "photography",
    brand: "JUNE ATLAS",
    category: "Photography Concept",
    title: "A story in the stillness.",
    description: "An editorial archive of places, spaces and ways of seeing.",
    color: "#1d2926",
    ink: "#eee7d8",
    image: "alpine",
  },
  {
    id: "corporate",
    brand: "MERIDIAN",
    category: "Corporate Website Concept",
    title: "A clearer way forward.",
    description:
      "Independent thinking and connected expertise for a new chapter.",
    color: "#edf0ec",
    ink: "#233746",
    image: "architecture",
  },
  {
    id: "furniture",
    brand: "FORM & FIELD",
    category: "Furniture & Interior Concept",
    title: "Made for living.",
    description:
      "Quiet forms, honest materials and a home that feels like you.",
    color: "#f1ede2",
    ink: "#5b5b44",
    image: "living-room",
  },
  {
    id: "real-estate",
    brand: "HAVEN",
    category: "Real Estate Concept",
    title: "Find a home. Feel at home.",
    description:
      "Thoughtfully selected spaces and a more personal property search.",
    color: "#e8eee7",
    ink: "#34574f",
    image: "house",
  },
  {
    id: "restaurant",
    brand: "SERA",
    category: "Restaurant Concept",
    title: "A little Italy. A good evening.",
    description:
      "Fresh pasta, seasonal plates and an unhurried neighbourhood table.",
    color: "#f5edda",
    ink: "#743d32",
    image: "pesto",
  },
] as const;
export type ProjectId = (typeof projects)[number]["id"];
export const projectComponents = {
  ecommerce: dynamic(() => import("./ecommerce"), { loading: ProjectLoading }),
  "ai-platform": dynamic(() => import("./ai-platform"), {
    loading: ProjectLoading,
  }),
  photography: dynamic(() => import("./photography"), {
    loading: ProjectLoading,
  }),
  corporate: dynamic(() => import("./corporate"), { loading: ProjectLoading }),
  furniture: dynamic(() => import("./furniture"), { loading: ProjectLoading }),
  "real-estate": dynamic(() => import("./real-estate"), {
    loading: ProjectLoading,
  }),
  restaurant: dynamic(() => import("./restaurant"), {
    loading: ProjectLoading,
  }),
};
