"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, Circle, Clock3, Folder, ArrowRight, FileText, CreditCard, MessageCircle, UserRound, Save, Send, LogOut, Trash2, Sparkles } from "lucide-react";
import type { Customer, CustomerPage } from "../../app/lib/customer/routes";
import type { Overview, Profile, Project } from "./workspace-types";
import { workspaceCopy, type WorkspaceCopy } from "./workspace-copy";
import styles from "./customer.module.css";
import TextActionLabel from "../text-action-label";
import SecuritySettings from "./security-settings";
import ProfilePhoto from "./profile-photo";
import { authCopy } from "../../app/sign-in/auth-copy";
import NotificationsMessages from "./notifications-messages";
import AccountAiConversations from "./account-ai-conversations";

type Locale = keyof typeof workspaceCopy;
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className={styles.field}><span>{label}</span>{children}</label>; }
function CustomerType({ value, onChange, t }: { value: Profile["customerType"]; onChange: (value: Profile["customerType"]) => void; t: WorkspaceCopy }) {
  return <Field label={t.customerType}><select value={value || ""} onChange={event => onChange((event.target.value || null) as Profile["customerType"])}><option value="">{t.unspecified}</option><option value="private">{t.private}</option><option value="company">{t.company}</option></select></Field>;
}
function Empty({ children, icon = "project" }: { children: ReactNode; icon?: "project" | "ai" }) {
  const Icon = icon === "ai" ? Sparkles : Folder;
  return <div className={styles.empty}><Icon size={28} strokeWidth={1.5} aria-hidden="true" /><p>{children}</p></div>;
}
function dateLabel(value: string | null, locale: Locale, fallback: string) { return value ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value)) : fallback; }
function ProjectProgress({ project, locale }: { project: Project; locale: Locale }) {
  const t = workspaceCopy[locale];
  return <>
    <div className={styles.progressHeading}><strong>{project.progress === null ? t.notProvided : `${project.progress}% ${t.progress}`}</strong>{project.remaining !== null && <span>{project.remaining} {t.remaining}</span>}</div>
    {project.progress !== null && <progress max={100} value={project.progress} aria-label={t.phases} />}
    <ol className={styles.steps}>{project.steps.map(step => {
      const Icon = step.status === "completed" ? Check : step.status === "in_progress" ? Clock3 : Circle;
      return <li key={step.key} data-status={step.status}><Icon size={18} aria-hidden="true" /><span>{t[step.key]}</span><small>{step.status ? t[step.status] : t.notProvided}</small></li>;
    })}</ol>
  </>;
}
function ProjectContent({ overview, locale, home }: { overview: Overview; locale: Locale; home: boolean }) {
  const t = workspaceCopy[locale];
  const project = overview.project;
  if (!project) return <section className={styles.section}><h2>{t.current}</h2><Empty>{t.noProject}</Empty><Link className={styles.textLink} href={home ? "/my-project" : "/dashboard/contact"}><TextActionLabel>{home ? t.view : t.contactTeam}</TextActionLabel><ArrowRight size={17} aria-hidden="true" /></Link></section>;
  function money(amount: number | null) {
    if (amount === null || !project?.currency) return t.notProvided;
    try { const format = new Intl.NumberFormat(locale, { style: "currency", currency: project.currency }); return format.format(amount / 10 ** (format.resolvedOptions().maximumFractionDigits ?? 2)); } catch { return t.notProvided; }
  }
  return <>
    <section className={styles.section}>
      <div className={styles.sectionHeading}><h2>{project.name || t.current}</h2><span className={styles.muted}>{project.status || t.notProvided}</span></div>
      {home ? <p>{project.progress === 100 ? t.finished : project.steps.some(step => step.status === "in_progress") ? t.ongoing : project.progress === 0 ? t.not_started : project.status || t.notProvided}</p> : <>
        <p className={styles.description}>{project.description || t.notProvided}</p>
        <dl className={styles.details}>{[
          [t.type, project.type], [t.order, project.orderNumber], [t.start, dateLabel(project.startedAt, locale, t.notProvided)],
          ...(overview.profile.customerType ? [[t.customerType, t[overview.profile.customerType]]] : []),
          ...(overview.profile.customerType === "company" && overview.profile.companyName ? [[t.companyName, overview.profile.companyName]] : []),
          [t.total, money(project.totalMinor)], [t.paid, money(project.paidMinor)], ...(project.remainingMinor !== null ? [[t.balance, money(project.remainingMinor)]] : []),
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || t.notProvided}</dd></div>)}</dl>
      </>}
      <ProjectProgress project={project} locale={locale} />
      <p className={styles.muted}>{t.updated}: {dateLabel(project.updatedAt, locale, t.noUpdates)}</p>
      {home ? <Link className={styles.textLink} href="/my-project"><TextActionLabel>{t.view}</TextActionLabel><ArrowRight size={17} aria-hidden="true" /></Link> : <div className={styles.actions}>
        <button disabled title={t.noInvoice}><FileText size={17} />{t.invoice}</button><button disabled title={t.noPayment}><CreditCard size={17} />{t.payment}</button><Link href="/dashboard/contact"><MessageCircle size={17} /><TextActionLabel>{t.contactTeam}</TextActionLabel></Link>
      </div>}
    </section>
    {!home && <section className={styles.section}><h2>{t.timeline}</h2>{project.timeline.length ? <ol className={styles.timeline}>{project.timeline.map((entry, index) => <li key={index}><time dateTime={entry.date || undefined}>{dateLabel(entry.date, locale, t.notProvided)}</time><p>{entry.text}</p></li>)}</ol> : <p className={styles.muted}>{t.noUpdates}</p>}</section>}
  </>;
}
async function save(action: "profile" | "contact", body: object) {
  const response = await fetch(`/api/customer/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  if (response.status === 401) { window.location.replace("/sign-in"); throw new Error("session"); }
  if (!response.ok) throw new Error("request");
  return response.json();
}
function Account({ overview, user, locale, signOut, signingOut }: { overview: Overview; user: Customer; locale: Locale; signOut: () => void; signingOut: boolean }) {
  const t = workspaceCopy[locale];
  const [profile, setProfile] = useState(overview.profile);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"saved" | "failure" | null>(null);
  const pending = useRef(false);
  const patch = (values: Partial<Profile>) => { setProfile(old => ({ ...old, ...values })); setNotice(null); };
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(null);
    try { const { loginMethods: _methods, ...values } = profile; await save("profile", values); if (profile.customerType !== "company") setProfile(old => ({ ...old, companyName: "", companyNumber: "" })); setNotice("saved"); }
    catch { setNotice("failure"); }
    finally { pending.current = false; setBusy(false); }
  }
  return <>
    <form onSubmit={submit} aria-busy={busy}>
      <section className={styles.section}>
        <h2>{t.profile}</h2><div className={styles.profileHeading}><span className={styles.profilePhoto} aria-label={t.photo}><ProfilePhoto src={user.profileImage} /></span><div><strong>{profile.fullName || user.email}</strong><p className={styles.muted}>{user.profileImage ? authCopy[locale].googlePhoto : t.photoLater}</p></div></div>
        <div className={styles.formGrid}>
          <Field label={t.fullName}><input autoComplete="name" maxLength={160} value={profile.fullName} onChange={event => patch({ fullName: event.target.value })} /></Field>
          <Field label={t.email}><input type="email" dir="ltr" value={user.email} readOnly aria-describedby="email-note" /></Field>
          <CustomerType value={profile.customerType} onChange={value => patch({ customerType: value })} t={t} />
          {profile.customerType === "company" && <><Field label={t.companyName}><input autoComplete="organization" maxLength={180} value={profile.companyName} onChange={event => patch({ companyName: event.target.value })} /></Field><Field label={t.companyNumber}><input maxLength={80} value={profile.companyNumber} onChange={event => patch({ companyNumber: event.target.value })} /></Field></>}
        </div><p id="email-note" className={styles.muted}>{t.emailNote}</p><p className={styles.identifier}>{t.accountId}: <bdi>{user.id}</bdi></p>
      </section>
      <section className={styles.section}><h2>{t.methods}</h2>{[["email", t.email], ["google", "Google"], ["bankid", "BankID"]].map(([key, title]) => <div className={styles.settingRow} key={key}><span>{title}</span><span className={styles.muted}>{profile.loginMethods.includes(key) ? t.linked : t.notLinked}</span></div>)}</section>
      <section className={styles.section}><h2>{t.notifications}</h2>{([['project', 'projectNotices'], ['team', 'teamNotices'], ['billing', 'billingNotices'], ['email', 'emailNotices']] as const).map(([key, label]) => <label key={key} className={styles.settingRow}><span>{t[label]}</span><input type="checkbox" role="switch" checked={profile.preferences[key]} onChange={event => patch({ preferences: { ...profile.preferences, [key]: event.target.checked } })} /></label>)}<p className={styles.muted}>{t.preferencesNote}</p></section>
      <div className={styles.saveRow}><button type="submit" className={styles.primary} disabled={busy}><Save size={17} /><TextActionLabel light>{busy ? t.saving : t.save}</TextActionLabel></button><p role={notice === "failure" ? "alert" : "status"}>{notice ? t[notice] : ""}</p></div>
    </form>
    <SecuritySettings locale={locale} passwordLogin={profile.loginMethods.includes("email")} />
    <section className={styles.section}><h2>{t.actions}</h2><div className={styles.actions}><button disabled title={t.deletionNote}><Trash2 size={17} />{t.delete}</button><button type="button" onClick={signOut} disabled={signingOut}><LogOut size={17} /><TextActionLabel>{locale === "ar" ? "تسجيل الخروج" : locale === "sv" ? "Logga ut" : "Sign out"}</TextActionLabel></button></div><p className={styles.muted}>{t.deletionNote}</p></section>
  </>;
}
function Contact({ overview, user, locale }: { overview: Overview; user: Customer; locale: Locale }) {
  const t = workspaceCopy[locale];
  const [form, setForm] = useState({ name: overview.profile.fullName, email: user.email, customerType: overview.profile.customerType, companyName: overview.profile.companyName, orderNumber: overview.project?.orderNumber || "", message: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"received" | "savedInbox" | "failure" | null>(null);
  const pending = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(null);
    try { const data = await save("contact", form); setNotice(data.emailNotified ? "received" : "savedInbox"); setForm(old => ({ ...old, message: "" })); }
    catch { setNotice("failure"); }
    finally { pending.current = false; setBusy(false); }
  }
  return <form className={styles.contactForm} onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}><div className={styles.formGrid}>
    <Field label={t.fullName}><input autoComplete="name" required maxLength={160} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></Field>
    <Field label={t.email}><input type="email" dir="ltr" autoComplete="email" required maxLength={254} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></Field>
    <CustomerType t={t} value={form.customerType} onChange={customerType => setForm({ ...form, customerType })} />
    {form.customerType === "company" && <Field label={t.companyName}><input autoComplete="organization" maxLength={180} value={form.companyName} onChange={event => setForm({ ...form, companyName: event.target.value })} /></Field>}
    <Field label={`${t.order} (${t.optional})`}><input maxLength={100} value={form.orderNumber} onChange={event => setForm({ ...form, orderNumber: event.target.value })} /></Field>
  </div><Field label={t.message}><textarea required minLength={3} maxLength={4000} rows={7} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} /></Field></fieldset><button className={styles.primary} disabled={busy}><Send size={17} /><TextActionLabel light>{busy ? t.sending : t.send}</TextActionLabel></button><p role={notice === "failure" ? "alert" : "status"}>{notice ? t[notice] : ""}</p></form>;
}
export default function WorkspaceContent({ page, overview, user, locale, signOut, signingOut }: { page: CustomerPage; overview: Overview; user: Customer; locale: Locale; signOut: () => void; signingOut: boolean }) {
  const t = workspaceCopy[locale];
  if (page === "notifications") return <NotificationsMessages locale={locale} />;
  if (page === "home") return <><p className={styles.welcome}>{t.welcome}{overview.profile.fullName ? `, ${overview.profile.fullName}` : ""}</p><ProjectContent overview={overview} locale={locale} home /></>;
  if (page === "project") return <ProjectContent overview={overview} locale={locale} home={false} />;
  if (page === "contact") return <Contact overview={overview} user={user} locale={locale} />;
  if (page === "account") return <Account overview={overview} user={user} locale={locale} signOut={signOut} signingOut={signingOut} />;
  return <AccountAiConversations />;
}
