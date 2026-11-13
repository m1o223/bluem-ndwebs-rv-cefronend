"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, Circle, Clock3, Folder, ArrowRight, FileText, CreditCard, MessageCircle, Save, Send, LogOut, Sparkles } from "lucide-react";
import type { Customer, CustomerPage } from "../../app/lib/customer/routes";
import type { Overview, Profile, Project } from "./workspace-types";
import { workspaceCopy, type WorkspaceCopy } from "./workspace-copy";
import styles from "./customer.module.css";
import TextActionLabel from "../text-action-label";
import { AiComingSoonLink } from "../ai-coming-soon";
import SecuritySettings from "./security-settings";
import ProfilePhoto from "./profile-photo";
import { authCopy } from "../../app/sign-in/auth-copy";
import NotificationsMessages from "./notifications-messages";
import AccountSettings from "./account-settings";

type Locale = keyof typeof workspaceCopy;
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className={styles.field}><span>{label}</span>{children}</label>; }
function CustomerType({ value, onChange, t }: { value: Profile["customerType"]; onChange: (value: Profile["customerType"]) => void; t: WorkspaceCopy }) {
  return <Field label={t.customerType}><select value={value || ""} onChange={event => onChange((event.target.value || null) as Profile["customerType"])}><option value="">{t.unspecified}</option><option value="private">{t.private}</option><option value="company">{t.company}</option></select></Field>;
}
function Empty({ children, icon = "project" }: { children: ReactNode; icon?: "project" | "ai" }) {
  const Icon = icon === "ai" ? Sparkles : Folder;
  return <div className={styles.empty}><Icon size={28} strokeWidth={1.5} aria-hidden="true" /><p>{children}</p></div>;
}
function dateLabel(value: string | null, locale: Locale, fallback: string) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(parsed) : fallback;
}

function normalizedValue(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function projectStatusLabel(value: string | null | undefined, t: WorkspaceCopy) {
  if (!value) return t.notProvided;
  const key = {
    received: "idea", submitted: "idea", order_received: "idea",
    in_progress: "in_progress", active: "in_progress", working: "in_progress",
    design: "direction", designing: "direction", design_direction: "direction",
    development: "development", developing: "development", build: "development",
    testing: "testing", test: "testing", review: "finalReview", awaiting_review: "finalReview",
    completed: "completed", complete: "completed", delivered: "completed", not_started: "not_started",
  }[normalizedValue(value)] as keyof WorkspaceCopy | undefined;
  return key ? t[key] : value;
}

function paymentStatusLabel(value: string | null | undefined, t: WorkspaceCopy) {
  if (!value) return t.notProvided;
  const key = {
    paid: "paidStatus", complete: "paidStatus", completed: "paidStatus",
    pending: "pendingStatus", awaiting: "pendingStatus", awaiting_payment: "pendingStatus",
    unpaid: "unpaidStatus", due: "unpaidStatus", failed: "unpaidStatus",
  }[normalizedValue(value)] as keyof WorkspaceCopy | undefined;
  return key ? t[key] : value;
}
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
function projectMoney(project: Project, amount: number | null, locale: Locale, fallback: string) {
  if (amount === null || !project.currency) return fallback;
  try {
    const format = new Intl.NumberFormat(locale, { style: "currency", currency: project.currency });
    return format.format(amount / 10 ** (format.resolvedOptions().maximumFractionDigits ?? 2));
  } catch { return fallback; }
}
function ProjectPreview({ project, t }: { project: Project; t: WorkspaceCopy }) {
  if (!project.previewUrl && !project.previewImageUrl) return null;
  return <div className={styles.projectPreview}>
    <p className={styles.eyebrow}>{t.projectPreview}</p>
    {project.previewImageUrl ? <img src={project.previewImageUrl} alt={`${project.name || t.current} ${t.projectPreview}`} /> : <iframe title={`${project.name || t.current} ${t.projectPreview}`} src={project.previewUrl || "about:blank"} loading="lazy" referrerPolicy="no-referrer" />}
    {project.previewUrl && <a href={project.previewUrl} target="_blank" rel="noreferrer" className={styles.previewLink}>{t.viewPreview}<ArrowRight size={16} aria-hidden="true" /></a>}
  </div>;
}
function HomeProjectCard({ project, overview, locale }: { project: Project; overview: Overview; locale: Locale }) {
  const t = workspaceCopy[locale];
  const description = (project.idea || project.description).trim();
  const isLongDescription = description.length > 260;
  const summary = isLongDescription ? `${description.slice(0, 260).trimEnd()}…` : description;
  const detailRows: [string, ReactNode][] = [
    [t.order, project.orderNumber || t.notProvided],
    project.createdAt ? [t.created, dateLabel(project.createdAt, locale, t.notProvided)] : [t.start, dateLabel(project.startedAt, locale, t.notProvided)],
    [t.expectedDuration, project.expectedDuration || t.notProvided],
    [t.deliveryDate, dateLabel(project.expectedDeliveryDate || null, locale, t.notProvided)],
    [t.type, project.type || t.notProvided],
    ...(overview.profile.customerType ? [[t.customerType, t[overview.profile.customerType]] as [string, ReactNode]] : []),
    ...(overview.profile.customerType === "company" && overview.profile.companyName ? [[t.companyName, overview.profile.companyName] as [string, ReactNode]] : []),
    ...(project.packageName ? [[t.packageName, project.packageName] as [string, ReactNode]] : []),
    ...(project.services?.length ? [[t.services, project.services.join(", ")] as [string, ReactNode]] : []),
  ];
  const paymentRows: [string, ReactNode][] = [
    [t.total, projectMoney(project, project.totalMinor, locale, t.notProvided)],
    [t.paid, projectMoney(project, project.paidMinor, locale, t.notProvided)],
    ...(project.remainingMinor !== null ? [[t.balance, projectMoney(project, project.remainingMinor, locale, t.notProvided)] as [string, ReactNode]] : []),
    ...(project.paymentStatus ? [[t.paymentStatus, paymentStatusLabel(project.paymentStatus, t)] as [string, ReactNode]] : []),
    ...(project.paymentMethod ? [[t.paymentMethod, project.paymentMethod] as [string, ReactNode]] : []),
  ];
  return <section className={`${styles.section} ${styles.projectCard}`}>
    <div className={styles.projectCardHeader}>
      <div><p className={styles.eyebrow}>{t.current}</p><h2>{project.name || t.current}</h2>{project.type && <p className={styles.projectType}>{project.type}</p>}</div>
      <span className={styles.projectStatus}>{projectStatusLabel(project.status, t)}</span>
    </div>
    <div className={`${styles.projectCardGrid} ${!project.previewUrl && !project.previewImageUrl ? styles.projectCardGridSingle : ""}`}>
      <ProjectPreview project={project} t={t} />
      <div className={styles.projectStage}>
        <div className={styles.stageSummary}><span>{t.status}</span><strong>{projectStatusLabel(project.status, t)}</strong><span>{t.updated}: {dateLabel(project.updatedAt, locale, t.noUpdates)}</span></div>
        <ProjectProgress project={project} locale={locale} />
      </div>
    </div>
    <div className={styles.projectInfoGrid}>
      <section className={styles.projectInfoGroup}><h3>{t.orderDetails}</h3><dl className={styles.details}>{detailRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <section className={styles.projectInfoGroup}><h3>{t.payment}</h3><dl className={styles.details}>{paymentRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{project.invoiceUrl && <div className={styles.invoiceActions}><a href={project.invoiceUrl} target="_blank" rel="noreferrer">{t.invoice}</a><a href={project.invoiceUrl} download>{t.downloadInvoice}</a></div>}</section>
    </div>
    {description && <section className={styles.projectDescription}><h3>{t.ideaLabel}</h3>{isLongDescription ? <details><summary>{t.viewDetails}</summary><p>{description}</p></details> : <p>{summary}</p>}</section>}
    {(project.requirements?.length || project.attachments?.length) ? <div className={styles.projectExtras}>
      {project.requirements?.length ? <section className={styles.projectInfoGroup}><h3>{t.requirements}</h3><ul>{project.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}</ul></section> : null}
      {project.attachments?.length ? <section className={styles.projectInfoGroup}><h3>{t.attachments}</h3><ul>{project.attachments.map(attachment => <li key={attachment.name}>{attachment.url ? <a href={attachment.url} target="_blank" rel="noreferrer">{attachment.name}</a> : attachment.name}</li>)}</ul></section> : null}
    </div> : null}
    {project.actionRequired && <aside className={styles.clientAction}><div><p className={styles.eyebrow}>{t.actionRequired}</p><p>{project.actionRequired}</p></div><Link href={project.actionUrl || "/my-project"}>{t.openAction}<ArrowRight size={16} aria-hidden="true" /></Link></aside>}
    <div className={styles.actions}><Link href="/my-project"><Folder size={17} /><TextActionLabel underline={false}>{t.view}</TextActionLabel></Link>{project.previewUrl && <a href={project.previewUrl} target="_blank" rel="noreferrer"><ArrowRight size={17} /><TextActionLabel underline={false}>{t.viewPreview}</TextActionLabel></a>}<Link href="/dashboard/contact"><MessageCircle size={17} /><TextActionLabel underline={false}>{t.contactTeam}</TextActionLabel></Link></div>
  </section>;
}
function ProjectDashboard({ overview, locale }: { overview: Overview; locale: Locale }) {
  const t = workspaceCopy[locale];
  const projects = overview.projects?.length ? overview.projects : overview.project ? [overview.project] : [];
  const name = overview.profile.fullName.trim();
  return <div className={styles.homeDashboard} data-reveal-group="account-home">
    <p className={styles.homeEyebrow}>{t.home}</p>
    <h1 className={styles.welcomeTitle}>{t.welcome}{name ? `, ${name}` : ""}</h1>
    {projects.length ? <div className={styles.homeProjects}>{projects.map((project, index) => <HomeProjectCard key={project.id || project.orderNumber || `${project.name}-${index}`} project={project} overview={overview} locale={locale} />)}</div> : <section className={`${styles.section} ${styles.emptyProject}`}><p className={styles.eyebrow}>{t.current}</p><Empty>{t.noProject}</Empty><AiComingSoonLink className={styles.primary} href="/blue-mind-ai"><Sparkles size={17} /><TextActionLabel light underline={false}>{t.startProject}</TextActionLabel></AiComingSoonLink></section>}
  </div>;
}
function ProjectContent({ overview, locale, home }: { overview: Overview; locale: Locale; home: boolean }) {
  const t = workspaceCopy[locale];
  const project = overview.project;
  if (!project) return <section className={styles.section}><h2>{t.current}</h2><Empty>{t.noProject}</Empty><Link className={styles.textLink} href={home ? "/my-project" : "/dashboard/contact"}><TextActionLabel>{home ? t.view : t.contactTeam}</TextActionLabel><ArrowRight size={17} aria-hidden="true" /></Link></section>;
  return <>
    <section className={styles.section}>
      <div className={styles.sectionHeading}><h2>{project.name || t.current}</h2><span className={styles.muted}>{projectStatusLabel(project.status, t)}</span></div>
      {home ? <p>{project.progress === 100 ? t.finished : project.steps.some(step => step.status === "in_progress") ? t.ongoing : project.progress === 0 ? t.not_started : projectStatusLabel(project.status, t)}</p> : <>
        <p className={styles.description}>{project.description || t.notProvided}</p>
        <dl className={styles.details}>{[
          [t.type, project.type], [t.order, project.orderNumber], [t.start, dateLabel(project.startedAt, locale, t.notProvided)],
          ...(overview.profile.customerType ? [[t.customerType, t[overview.profile.customerType]]] : []),
          ...(overview.profile.customerType === "company" && overview.profile.companyName ? [[t.companyName, overview.profile.companyName]] : []),
          [t.total, projectMoney(project, project.totalMinor, locale, t.notProvided)], [t.paid, projectMoney(project, project.paidMinor, locale, t.notProvided)], ...(project.remainingMinor !== null ? [[t.balance, projectMoney(project, project.remainingMinor, locale, t.notProvided)]] : []),
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
        <h2>{t.profile}</h2><div className={styles.profileHeading}><span className={styles.profilePhoto} aria-label={t.photo}><ProfilePhoto src={user.profileImage} /></span><div><strong>{profile.fullName || user.email}</strong>{user.profileImage && <p className={styles.muted}>{authCopy[locale].googlePhoto}</p>}</div></div>
        <div className={styles.formGrid}>
          <Field label={t.fullName}><input autoComplete="name" maxLength={160} value={profile.fullName} onChange={event => patch({ fullName: event.target.value })} /></Field>
          <Field label={t.email}><input type="email" dir="ltr" value={user.email} readOnly aria-describedby="email-note" /></Field>
          <CustomerType value={profile.customerType} onChange={value => patch({ customerType: value })} t={t} />
          {profile.customerType === "company" && <><Field label={t.companyName}><input autoComplete="organization" maxLength={180} value={profile.companyName} onChange={event => patch({ companyName: event.target.value })} /></Field><Field label={t.companyNumber}><input maxLength={80} value={profile.companyNumber} onChange={event => patch({ companyNumber: event.target.value })} /></Field></>}
        </div><p id="email-note" className={styles.muted}>{t.emailNote}</p><p className={styles.identifier}>{t.accountId}: <bdi>{user.id}</bdi></p>
      </section>
      <section className={styles.section}><h2>{t.methods}</h2>{[["email", t.email], ["google", "Google"], ["bankid", "BankID"]].map(([key, title]) => <div className={styles.settingRow} key={key}><span>{title}</span><span className={styles.muted}>{profile.loginMethods.includes(key) ? t.linked : t.notLinked}</span></div>)}</section>
      <section className={styles.section}><h2>{t.notifications}</h2>{([['project', 'projectNotices'], ['team', 'teamNotices'], ['billing', 'billingNotices'], ['email', 'emailNotices']] as const).map(([key, label]) => <label key={key} className={styles.settingRow}><span>{t[label]}</span><input type="checkbox" role="switch" checked={profile.preferences[key]} onChange={event => patch({ preferences: { ...profile.preferences, [key]: event.target.checked } })} /></label>)}</section>
      <div className={styles.saveRow}><button type="submit" className={styles.primary} disabled={busy}><Save size={17} /><TextActionLabel light underline={false}>{busy ? t.saving : t.save}</TextActionLabel></button><p role={notice === "failure" ? "alert" : "status"}>{notice ? t[notice] : ""}</p></div>
    </form>
    <SecuritySettings locale={locale} passwordLogin={profile.loginMethods.includes("email")} />
    <section className={styles.section}><h2>{t.actions}</h2><div className={styles.actions}><button type="button" onClick={signOut} disabled={signingOut}><LogOut size={17} /><TextActionLabel underline={false}>{locale === "ar" ? "تسجيل الخروج" : locale === "sv" ? "Logga ut" : "Sign out"}</TextActionLabel></button></div></section>
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
  </div><Field label={t.message}><textarea required minLength={3} maxLength={4000} rows={7} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} /></Field></fieldset><button className={styles.primary} disabled={busy}><Send size={17} /><TextActionLabel light underline={false}>{busy ? t.sending : t.send}</TextActionLabel></button><p role={notice === "failure" ? "alert" : "status"}>{notice ? t[notice] : ""}</p></form>;
}
export default function WorkspaceContent({ page, overview, user, locale, signOut, signingOut }: { page: CustomerPage; overview: Overview; user: Customer; locale: Locale; signOut: () => void; signingOut: boolean }) {
  const t = workspaceCopy[locale];
  if (page === "notifications") return <NotificationsMessages locale={locale} />;
  if (page === "home") return <ProjectDashboard overview={overview} locale={locale} />;
  if (page === "project") return <ProjectContent overview={overview} locale={locale} home={false} />;
  if (page === "contact") return <Contact overview={overview} user={user} locale={locale} />;
  if (page === "account") return <AccountSettings overview={overview} user={user} locale={locale} signOut={signOut} signingOut={signingOut} />;
  return null;
}
