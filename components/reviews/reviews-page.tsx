"use client";

import { Star, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./reviews-page.module.css";

type DemoReview = {
  id: string;
  name: string;
  service: string;
  quote: string;
  rating: number;
};

type PublicReview = {
  id: string;
  rating: number;
  comment: string;
  locale: Locale;
  createdAt: string;
};

type ReviewsCopy = {
  title: string;
  description: string;
  addReview: string;
  modalTitle: string;
  commentPlaceholder: string;
  publishReview: string;
  close: string;
  ratingLabel: string;
  visitor: string;
  visitorService: string;
  published: string;
  loading: string;
  genericError: string;
  demoNotice: string;
  cards: DemoReview[];
};

const copy: Record<Locale, ReviewsCopy> = {
  en: {
    title: "Reviews",
    description: "Read what visitors have shared and add your own experience.",
    addReview: "Add your review",
    modalTitle: "Add your review",
    commentPlaceholder: "Write your comment...",
    publishReview: "Publish your review",
    close: "Close",
    ratingLabel: "Rating: {count} out of 5",
    visitor: "Website visitor",
    visitorService: "Visitor review",
    published: "Published review",
    loading: "Loading reviews...",
    genericError: "We could not publish your review. Please try again.",
    demoNotice: "Demo content - not a real review",
    cards: [
      { id: "demo-cafe", name: "Demo Caf\u00e9", service: "Restaurant website", quote: "A clear, welcoming layout made the menu easy to explore.", rating: 5 },
      { id: "demo-northline", name: "Northline Studio", service: "Portfolio website", quote: "The structure gave the studio a calm place to show its work.", rating: 5 },
      { id: "demo-luma", name: "Luma Wellness", service: "Service website", quote: "The page flow made the important information simple to find.", rating: 4 },
      { id: "demo-harbor", name: "Harbor & Co.", service: "Business website", quote: "A focused homepage helped the team explain what it offers.", rating: 5 },
      { id: "demo-form", name: "Form & Function", service: "Online store concept", quote: "The content feels organized and ready to grow with the project.", rating: 4 },
      { id: "demo-norrsken", name: "Norrsken Events", service: "Event website", quote: "A flexible layout kept the event details easy to scan.", rating: 5 },
    ],
  },
  sv: {
    title: "Recensioner",
    description: "L\u00e4s vad bes\u00f6kare har delat och l\u00e4gg till din egen upplevelse.",
    addReview: "L\u00e4gg till ditt omd\u00f6me",
    modalTitle: "L\u00e4gg till ditt omd\u00f6me",
    commentPlaceholder: "Skriv din kommentar...",
    publishReview: "Publicera ditt omd\u00f6me",
    close: "St\u00e4ng",
    ratingLabel: "Betyg: {count} av 5",
    visitor: "Webbplatsbes\u00f6kare",
    visitorService: "Bes\u00f6karomd\u00f6me",
    published: "Publicerat omd\u00f6me",
    loading: "Laddar recensioner...",
    genericError: "Det gick inte att publicera ditt omd\u00f6me. F\u00f6rs\u00f6k igen.",
    demoNotice: "Demoinneh\u00e5ll - inte ett riktigt omd\u00f6me",
    cards: [
      { id: "demo-cafe", name: "Demo Caf\u00e9", service: "Restaurangwebbplats", quote: "En tydlig och v\u00e4lkomnande layout gjorde menyn enkel att utforska.", rating: 5 },
      { id: "demo-northline", name: "Northline Studio", service: "Portfolio-webbplats", quote: "Strukturen gav studion en lugn plats att visa sitt arbete.", rating: 5 },
      { id: "demo-luma", name: "Luma Wellness", service: "Tj\u00e4nstewebbplats", quote: "Sidans fl\u00f6de gjorde den viktigaste informationen enkel att hitta.", rating: 4 },
      { id: "demo-harbor", name: "Harbor & Co.", service: "F\u00f6retagswebbplats", quote: "En fokuserad startsida hj\u00e4lpte teamet att f\u00f6rklara sitt erbjudande.", rating: 5 },
      { id: "demo-form", name: "Form & Function", service: "Koncept f\u00f6r webbutik", quote: "Inneh\u00e5llet k\u00e4nns organiserat och redo att v\u00e4xa med projektet.", rating: 4 },
      { id: "demo-norrsken", name: "Norrsken Events", service: "Evenemangswebbplats", quote: "En flexibel layout gjorde evenemangets detaljer enkla att \u00f6verblicka.", rating: 5 },
    ],
  },
  ar: {
    title: "\u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a",
    description: "\u0627\u0642\u0631\u0623 \u062a\u062c\u0627\u0631\u0628 \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u0623\u0636\u0641 \u062a\u062c\u0631\u0628\u062a\u0643.",
    addReview: "\u0623\u0636\u0641 \u062a\u0639\u0644\u064a\u0642\u0643",
    modalTitle: "\u0623\u0636\u0641 \u062a\u0639\u0644\u064a\u0642\u0643",
    commentPlaceholder: "\u0627\u0643\u062a\u0628 \u062a\u0639\u0644\u064a\u0642\u0643...",
    publishReview: "\u0627\u0646\u0634\u0631 \u062a\u0639\u0644\u064a\u0642\u0643",
    close: "\u0625\u063a\u0644\u0627\u0642",
    ratingLabel: "\u0627\u0644\u062a\u0642\u064a\u064a\u0645: {count} \u0645\u0646 5",
    visitor: "\u0632\u0627\u0626\u0631 \u0627\u0644\u0645\u0648\u0642\u0639",
    visitorService: "\u062a\u0642\u064a\u064a\u0645 \u0632\u0627\u0626\u0631",
    published: "\u062a\u0642\u064a\u064a\u0645 \u0645\u0646\u0634\u0648\u0631",
    loading: "\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a...",
    genericError: "\u062a\u0639\u0630\u0651\u0631 \u0646\u0634\u0631 \u062a\u0642\u064a\u064a\u0645\u0643. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    demoNotice: "\u0646\u0645\u0648\u0630\u062c \u062a\u062c\u0631\u064a\u0628\u064a - \u0644\u064a\u0633 \u062a\u0642\u064a\u064a\u0645\u064b\u0627 \u062d\u0642\u064a\u0642\u064a\u064b\u0627",
    cards: [
      { id: "demo-cafe", name: "Demo Caf\u00e9", service: "\u0645\u0648\u0642\u0639 \u0645\u0637\u0639\u0645", quote: "\u062a\u0635\u0645\u064a\u0645 \u0648\u0627\u0636\u062d \u0648\u0645\u0631\u062d\u0628 \u062c\u0639\u0644 \u0627\u0633\u062a\u0643\u0634\u0627\u0641 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0623\u0633\u0647\u0644.", rating: 5 },
      { id: "demo-northline", name: "Northline Studio", service: "\u0645\u0648\u0642\u0639 \u0623\u0639\u0645\u0627\u0644", quote: "\u0645\u0646\u062d \u0627\u0644\u0647\u064a\u0643\u0644 \u0627\u0644\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0645\u0633\u0627\u062d\u0629 \u0647\u0627\u062f\u0626\u0629 \u0644\u0639\u0631\u0636 \u0623\u0639\u0645\u0627\u0644\u0647.", rating: 5 },
      { id: "demo-luma", name: "Luma Wellness", service: "\u0645\u0648\u0642\u0639 \u062e\u062f\u0645\u0627\u062a", quote: "\u062c\u0639\u0644 \u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0647\u0645\u0629 \u0633\u0647\u0644\u0629 \u0627\u0644\u0648\u0635\u0648\u0644.", rating: 4 },
      { id: "demo-harbor", name: "Harbor & Co.", service: "\u0645\u0648\u0642\u0639 \u0634\u0631\u0643\u0629", quote: "\u0633\u0627\u0639\u062f \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u0627\u0644\u0645\u0631\u0643\u0632\u0629 \u0627\u0644\u0641\u0631\u064a\u0642 \u0639\u0644\u0649 \u0634\u0631\u062d \u062e\u062f\u0645\u0627\u062a\u0647.", rating: 5 },
      { id: "demo-form", name: "Form & Function", service: "\u0645\u0641\u0647\u0648\u0645 \u0645\u062a\u062c\u0631 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a", quote: "\u064a\u0628\u062f\u0648 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0645\u0631\u062a\u0628\u064b\u0627 \u0648\u0645\u0633\u062a\u0639\u062f\u064b\u0627 \u0644\u0644\u0646\u0645\u0648 \u0645\u0639 \u0627\u0644\u0645\u0634\u0631\u0648\u0639.", rating: 4 },
      { id: "demo-norrsken", name: "Norrsken Events", service: "\u0645\u0648\u0642\u0639 \u0641\u0639\u0627\u0644\u064a\u0627\u062a", quote: "\u062d\u0627\u0641\u0638 \u0627\u0644\u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0645\u0631\u0646 \u0639\u0644\u0649 \u0648\u0636\u0648\u062d \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0629.", rating: 5 },
    ],
  },
};

function RatingStars({ value, onChange, label }: { value: number; onChange?: (value: number) => void; label: string }) {
  return (
    <div className={styles.rating} role={onChange ? "radiogroup" : undefined} aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = <Star size={onChange ? 29 : 20} strokeWidth={1.8} fill={star <= value ? "currentColor" : "transparent"} aria-hidden="true" />;
        if (!onChange) return <span className={styles.ratingStar} data-filled={star <= value} key={star}>{icon}</span>;
        return <button className={styles.ratingButton} key={star} type="button" role="radio" aria-checked={star === value} aria-label={label.replace("{count}", String(star))} onClick={() => onChange(star)}>{icon}</button>;
      })}
    </div>
  );
}

export default function ReviewsPageContent() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";
  const [publicReviews, setPublicReviews] = useState<PublicReview[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.dataset.reviewsPage = "true";
    return () => { delete document.body.dataset.reviewsPage; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/reviews", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("reviews unavailable");
        const data = await response.json();
        if (active && data?.success === true && Array.isArray(data.reviews)) setPublicReviews(data.reviews);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !isSubmitting) setDialogOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [dialogOpen, isSubmitting]);

  const reviews = useMemo(() => [
    ...publicReviews.map((review) => ({ id: review.id, name: text.visitor, service: text.visitorService, quote: review.comment, rating: review.rating, published: true })),
    ...text.cards.map((review) => ({ ...review, published: false })),
  ], [publicReviews, text]);

  async function publishReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const comment = draftComment.trim();
    if (!draftRating || !comment) {
      setSubmitError(text.genericError);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: draftRating, comment, locale }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success !== true || !data.review) throw new Error("publish failed");
      setPublicReviews((current) => [data.review, ...current]);
      setDialogOpen(false);
      setDraftRating(0);
      setDraftComment("");
    } catch {
      setSubmitError(text.genericError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page} dir={direction} data-no-translate>
      <header className={styles.intro}>
        <div className={styles.heroMark} aria-hidden="true"><Star size={58} strokeWidth={1.3} /></div>
        <h1>{text.title}</h1>
        <p className={styles.description}>{text.description}</p>
        <button className={styles.addReviewButton} type="button" onClick={() => { setSubmitError(""); setDialogOpen(true); }}>{text.addReview}</button>
      </header>

      <section className={styles.grid} aria-label={text.title}>
        {reviews.map((review) => (
          <article className={styles.card} key={review.id}>
            <div className={styles.cardTop}>
              <span className={styles.avatar} aria-hidden="true"><UserRound size={22} strokeWidth={1.8} /></span>
              <div><h2>{review.name}</h2><p className={styles.service}>{review.service}</p></div>
            </div>
            <RatingStars value={review.rating} label={text.ratingLabel.replace("{count}", String(review.rating))} />
            <p className={styles.quote}>{review.quote}</p>
            <p className={styles.demoNotice}>{review.published ? text.published : text.demoNotice}</p>
          </article>
        ))}
      </section>

      {dialogOpen && (
        <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) setDialogOpen(false); }}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="reviews-dialog-title" dir={direction}>
            <button className={styles.dialogClose} type="button" aria-label={text.close} onClick={() => setDialogOpen(false)} disabled={isSubmitting}><X size={20} aria-hidden="true" /></button>
            <h2 id="reviews-dialog-title">{text.modalTitle}</h2>
            <form onSubmit={publishReview}>
              <RatingStars value={draftRating} onChange={setDraftRating} label={text.ratingLabel} />
              <textarea value={draftComment} onChange={(event) => setDraftComment(event.target.value)} placeholder={text.commentPlaceholder} rows={5} maxLength={1200} autoFocus />
              {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
              <button className={styles.publishButton} type="submit" disabled={isSubmitting}>{isSubmitting ? text.loading : text.publishReview}</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
