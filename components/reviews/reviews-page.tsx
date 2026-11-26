"use client";

import { Check, Pencil, Star, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocalization, type Locale } from "../localization-provider";
import styles from "./reviews-page.module.css";

type PublicReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  locale: Locale;
  createdAt: string;
  canEdit: boolean;
};

type ReviewsCopy = {
  title: string;
  description: string;
  addReview: string;
  modalTitle: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  orderNumberLabel: string;
  orderNumberPlaceholder: string;
  codeLabel: string;
  codePlaceholder: string;
  sendCode: string;
  verifyCode: string;
  verified: string;
  commentPlaceholder: string;
  publishReview: string;
  editReview: string;
  saveReview: string;
  close: string;
  ratingLabel: string;
  published: string;
  loading: string;
  genericError: string;
  validationError: string;
  verificationRequired: string;
  verificationSent: string;
};

const copy: Record<Locale, ReviewsCopy> = {
  en: {
    title: "Reviews",
    description: "Read what customers have shared and add your own experience.",
    addReview: "Add your review",
    modalTitle: "Add your review",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter the name shown publicly",
    emailLabel: "Email address",
    emailPlaceholder: "The email used for your order",
    orderNumberLabel: "Order number",
    orderNumberPlaceholder: "For example, #515",
    codeLabel: "Verification code",
    codePlaceholder: "Enter the 6-digit code",
    sendCode: "Send verification code",
    verifyCode: "Verify email",
    verified: "Email verified",
    commentPlaceholder: "Write your review...",
    publishReview: "Publish your review",
    editReview: "Edit my review",
    saveReview: "Save changes",
    close: "Close",
    ratingLabel: "Rating: {count} out of 5",
    published: "Published {date}",
    loading: "Saving...",
    genericError: "We could not save your review. Please try again.",
    validationError: "Enter a username, choose a rating, and write a review before publishing.",
    verificationRequired: "Verify the order email before publishing your review.",
    verificationSent: "A verification code was sent to the order email.",
  },
  sv: {
    title: "Recensioner",
    description: "Läs vad kunder har delat och lägg till din egen upplevelse.",
    addReview: "Lägg till ditt omdöme",
    modalTitle: "Lägg till ditt omdöme",
    usernameLabel: "Användarnamn",
    usernamePlaceholder: "Namnet som visas offentligt",
    emailLabel: "E-postadress",
    emailPlaceholder: "E-postadressen för din order",
    orderNumberLabel: "Ordernummer",
    orderNumberPlaceholder: "Till exempel #515",
    codeLabel: "Verifieringskod",
    codePlaceholder: "Ange den sexsiffriga koden",
    sendCode: "Skicka verifieringskod",
    verifyCode: "Verifiera e-post",
    verified: "E-post verifierad",
    commentPlaceholder: "Skriv ditt omdöme...",
    publishReview: "Publicera ditt omdöme",
    editReview: "Redigera mitt omdöme",
    saveReview: "Spara ändringar",
    close: "Stäng",
    ratingLabel: "Betyg: {count} av 5",
    published: "Publicerat {date}",
    loading: "Sparar...",
    genericError: "Det gick inte att spara ditt omdöme. Försök igen.",
    validationError: "Ange ett användarnamn, välj ett betyg och skriv ett omdöme innan du publicerar.",
    verificationRequired: "Verifiera orderns e-postadress innan du publicerar ditt omdöme.",
    verificationSent: "En verifieringskod skickades till orderns e-postadress.",
  },
  ar: {
    title: "التقييمات",
    description: "اقرأ ما شاركه العملاء وأضف تجربتك.",
    addReview: "أضف تقييمك",
    modalTitle: "أضف تقييمك",
    usernameLabel: "اسم المستخدم",
    usernamePlaceholder: "الاسم الذي سيظهر للزوار",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "البريد المستخدم في الطلب",
    orderNumberLabel: "رقم الطلب",
    orderNumberPlaceholder: "مثال: #515",
    codeLabel: "رمز التحقق",
    codePlaceholder: "اكتب الرمز المؤلف من 6 أرقام",
    sendCode: "أرسل رمز التحقق",
    verifyCode: "تحقق من البريد",
    verified: "تم التحقق من البريد",
    commentPlaceholder: "اكتب تقييمك...",
    publishReview: "انشر تقييمك",
    editReview: "تعديل تقييمي",
    saveReview: "حفظ التعديلات",
    close: "إغلاق",
    ratingLabel: "التقييم: {count} من 5",
    published: "نُشر في {date}",
    loading: "جارٍ الحفظ...",
    genericError: "تعذّر حفظ تقييمك. حاول مرة أخرى.",
    validationError: "اكتب اسم المستخدم، واختر تقييماً، واكتب تعليقاً قبل النشر.",
    verificationRequired: "تحقق من بريد الطلب قبل نشر التقييم.",
    verificationSent: "أُرسل رمز التحقق إلى بريد الطلب.",
  },
};

function makeSubmissionKey() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatReviewDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const language = locale === "ar" ? "ar" : locale === "sv" ? "sv-SE" : "en-US";
  return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(date);
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftOrderNumber, setDraftOrderNumber] = useState("");
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [checkoutAttemptId, setCheckoutAttemptId] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !isSubmitting && !isVerifying) setDialogOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [dialogOpen, isSubmitting, isVerifying]);

  function resetVerification() {
    setVerificationCode("");
    setCheckoutAttemptId("");
    setVerificationToken("");
    setVerificationSent(false);
  }

  function startNewReview() {
    setEditingId(null);
    setDraftName("");
    setDraftEmail("");
    setDraftOrderNumber("");
    setDraftRating(0);
    setDraftComment("");
    resetVerification();
    setSubmissionKey(makeSubmissionKey());
    setSubmitError("");
    setDialogOpen(true);
  }

  function startEditing(review: PublicReview) {
    setEditingId(review.id);
    setDraftName(review.name);
    setDraftEmail("");
    setDraftOrderNumber("");
    setDraftRating(review.rating);
    setDraftComment(review.comment);
    resetVerification();
    setSubmissionKey("");
    setSubmitError("");
    setDialogOpen(true);
  }

  async function requestVerification() {
    const email = draftEmail.trim();
    const orderNumber = draftOrderNumber.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !orderNumber) {
      setSubmitError(text.verificationRequired);
      return;
    }
    setIsVerifying(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/reviews/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderNumber, locale, checkoutAttemptId: checkoutAttemptId || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success !== true || !data.verification?.checkoutAttemptId) throw new Error("verification send failed");
      setCheckoutAttemptId(data.verification.checkoutAttemptId);
      setVerificationSent(true);
    } catch {
      setSubmitError(text.genericError);
    } finally {
      setIsVerifying(false);
    }
  }

  async function verifyReviewEmail() {
    if (!checkoutAttemptId || !/^\d{6}$/.test(verificationCode.trim())) {
      setSubmitError(text.verificationRequired);
      return;
    }
    setIsVerifying(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/order-email-verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draftEmail.trim(), checkoutAttemptId, code: verificationCode.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success !== true || !data.verification?.verificationToken) throw new Error("verification failed");
      setVerificationToken(data.verification.verificationToken);
      setSubmitError("");
    } catch {
      setSubmitError(text.genericError);
    } finally {
      setIsVerifying(false);
    }
  }

  async function publishReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    const comment = draftComment.trim();
    if (!name || !draftRating || !comment) {
      setSubmitError(text.validationError);
      return;
    }
    if (!editingId && (!verificationToken || !draftEmail.trim() || !draftOrderNumber.trim())) {
      setSubmitError(text.verificationRequired);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/reviews", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(!editingId && submissionKey ? { "x-review-idempotency-key": submissionKey } : {}),
        },
        body: JSON.stringify({
          id: editingId,
          name,
          rating: draftRating,
          comment,
          locale,
          ...(!editingId ? {
            email: draftEmail.trim(),
            orderNumber: draftOrderNumber.trim(),
            checkoutAttemptId,
            emailVerificationToken: verificationToken,
          } : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success !== true || !data.review) throw new Error("publish failed");
      setPublicReviews((current) => editingId
        ? current.map((review) => review.id === editingId ? data.review : review)
        : [data.review, ...current]);
      setDialogOpen(false);
      setEditingId(null);
      setDraftName("");
      setDraftEmail("");
      setDraftOrderNumber("");
      setDraftRating(0);
      setDraftComment("");
      resetVerification();
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
        <button className={styles.addReviewButton} type="button" onClick={startNewReview}>{text.addReview}</button>
      </header>

      {publicReviews.length > 0 && (
        <section className={styles.grid} aria-label={text.title}>
          {publicReviews.map((review) => (
            <article className={styles.card} key={review.id}>
              <div className={styles.cardTop}>
                <span className={styles.avatar} aria-hidden="true"><UserRound size={20} strokeWidth={1.8} /></span>
                <div className={styles.cardIdentity}><h2>{review.name}</h2><time dateTime={review.createdAt}>{text.published.replace("{date}", formatReviewDate(review.createdAt, locale))}</time></div>
              </div>
              <RatingStars value={review.rating} label={text.ratingLabel.replace("{count}", String(review.rating))} />
              <p className={styles.quote}>{review.comment}</p>
              {review.canEdit && (
                <button className={styles.editButton} type="button" onClick={() => startEditing(review)}>
                  <Pencil size={15} aria-hidden="true" />
                  <span>{text.editReview}</span>
                </button>
              )}
            </article>
          ))}
        </section>
      )}

      {dialogOpen && (
        <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting && !isVerifying) setDialogOpen(false); }}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="reviews-dialog-title" dir={direction}>
            <button className={styles.dialogClose} type="button" aria-label={text.close} onClick={() => setDialogOpen(false)} disabled={isSubmitting || isVerifying}><X size={20} aria-hidden="true" /></button>
            <h2 id="reviews-dialog-title">{editingId ? text.editReview : text.modalTitle}</h2>
            <form onSubmit={publishReview}>
              <label className={styles.field} htmlFor="reviews-username">
                <span>{text.usernameLabel}</span>
                <input id="reviews-username" value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder={text.usernamePlaceholder} maxLength={120} autoComplete="nickname" required />
              </label>

              {!editingId && <>
                <label className={styles.field} htmlFor="reviews-email">
                  <span>{text.emailLabel}</span>
                  <input id="reviews-email" type="email" value={draftEmail} onChange={(event) => { setDraftEmail(event.target.value); resetVerification(); }} placeholder={text.emailPlaceholder} maxLength={320} autoComplete="email" required />
                </label>
                <label className={styles.field} htmlFor="reviews-order-number">
                  <span>{text.orderNumberLabel}</span>
                  <input id="reviews-order-number" value={draftOrderNumber} onChange={(event) => { setDraftOrderNumber(event.target.value); resetVerification(); }} placeholder={text.orderNumberPlaceholder} maxLength={40} inputMode="numeric" required />
                </label>
                <button className={styles.verifyButton} type="button" onClick={requestVerification} disabled={isVerifying || isSubmitting || Boolean(verificationToken)}>{isVerifying ? text.loading : text.sendCode}</button>
                {verificationSent && !verificationToken && <div className={styles.verificationBox}>
                  <p className={styles.verificationHint}>{text.verificationSent}</p>
                  <label className={styles.field} htmlFor="reviews-verification-code">
                    <span>{text.codeLabel}</span>
                    <input id="reviews-verification-code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={text.codePlaceholder} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
                  </label>
                  <button className={styles.verifyButton} type="button" onClick={verifyReviewEmail} disabled={isVerifying || isSubmitting}>{isVerifying ? text.loading : text.verifyCode}</button>
                </div>}
                {verificationToken && <p className={styles.verifiedNotice}><Check size={16} aria-hidden="true" />{text.verified}</p>}
              </>}

              <RatingStars value={draftRating} onChange={setDraftRating} label={text.ratingLabel} />
              <textarea aria-label={text.commentPlaceholder} value={draftComment} onChange={(event) => setDraftComment(event.target.value)} placeholder={text.commentPlaceholder} rows={5} maxLength={1200} required />
              {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
              <button className={styles.publishButton} type="submit" disabled={isSubmitting || isVerifying}>{isSubmitting ? text.loading : editingId ? text.saveReview : text.publishReview}</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
