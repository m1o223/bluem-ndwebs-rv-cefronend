export type Profile = {
  fullName: string; customerType: "private" | "company" | null; companyName: string; companyNumber: string;
  preferences: Record<"project" | "team" | "billing" | "email", boolean>; loginMethods: string[];
};
export const steps = ["idea", "review", "direction", "development", "testing", "finalReview", "delivery"] as const;
export type Project = {
  id?: string; name: string; description: string; type: string; orderNumber: string; startedAt: string | null; updatedAt: string | null; status: string;
  progress: number | null; remaining: number | null;
  steps: { key: typeof steps[number]; status: "completed" | "in_progress" | "not_started" | null }[];
  currency: string | null; totalMinor: number | null; paidMinor: number | null; remainingMinor: number | null;
  timeline: { text: string; date: string | null }[];
  createdAt?: string | null; expectedDuration?: string | null; expectedDeliveryDate?: string | null;
  packageName?: string | null; services?: string[]; idea?: string | null; requirements?: string[];
  attachments?: { name: string; url?: string | null }[]; previewUrl?: string | null; previewImageUrl?: string | null;
  paymentStatus?: string | null; paymentMethod?: string | null; invoiceUrl?: string | null;
  actionRequired?: string | null; actionUrl?: string | null;
};
export type Overview = { profile: Profile; project: Project | null; projects?: Project[]; notifications: { id: string; text: string; createdAt: string | null; read: boolean }[] };
