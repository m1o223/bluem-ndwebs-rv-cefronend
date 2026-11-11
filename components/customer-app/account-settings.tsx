"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Camera, Check, Eye, EyeOff, Globe2, KeyRound, Link2, Mail, ScanFace, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import type { Customer } from "../../app/lib/customer/routes";
import type { Profile } from "./workspace-types";
import { accountSettingsCopy } from "./account-settings-copy";
import styles from "./customer.module.css";
import ProfilePhoto from "./profile-photo";
import SecuritySettings from "./security-settings";

type Locale = keyof typeof accountSettingsCopy;
type LoginMethod = "email" | "google" | "bankid";
type Dialog = LoginMethod | "delete" | null;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

function LocalAvatar({ preview, user, label }: { preview: string | null; user: Customer; label: string }) {
  return <span className={styles.profilePhoto} aria-label={label}>
    {preview ? <img src={preview} alt="" width={64} height={64} /> : <ProfilePhoto src={user.profileImage} />}
  </span>;
}

async function saveProfile(profile: Profile, preferences: Profile["preferences"]) {
  const { loginMethods: _loginMethods, ...profileValues } = profile;
  const response = await fetch("/api/customer/profile", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...profileValues, preferences }),
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 401) { window.location.replace("/sign-in"); throw new Error("session"); }
  if (!response.ok) throw new Error("profile");
}

export default function AccountSettings({ overview, user, locale, signOut, signingOut }: { overview: { profile: Profile }; user: Customer; locale: Locale; signOut: () => void; signingOut: boolean }) {
  const t = accountSettingsCopy[locale];
  const [profile, setProfile] = useState(overview.profile);
  const [savedProfile, setSavedProfile] = useState(overview.profile);
  const [preferences, setPreferences] = useState(overview.profile.preferences);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileNotice, setProfileNotice] = useState<"saved" | "failure" | "nameRequired" | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [photoError, setPhotoError] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleteStep, setDeleteStep] = useState<"warning" | "verify">("warning");
  const [methodNotice, setMethodNotice] = useState<"ready" | "notConnected" | null>(null);
  const [methodError, setMethodError] = useState<"mismatch" | "short" | null>(null);
  const [deleteNotice, setDeleteNotice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePending = useRef(false);

  useEffect(() => {
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dialog]);

  useEffect(() => {
    const open = Boolean(dialog || cropSource);
    if (open) document.body.dataset.accountModal = "true";
    else delete document.body.dataset.accountModal;
    return () => { delete document.body.dataset.accountModal; };
  }, [dialog, cropSource]);

  function patch(values: Partial<Profile>) {
    setProfile(current => ({ ...current, ...values }));
    setProfileNotice(null);
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profilePending.current) return;
    if (!profile.fullName.trim()) { setProfileNotice("nameRequired"); return; }
    profilePending.current = true;
    setProfileBusy(true);
    setProfileNotice(null);
    try {
      const nextProfile = { ...profile, fullName: profile.fullName.trim() };
      await saveProfile(nextProfile, overview.profile.preferences);
      setProfile(nextProfile);
      setSavedProfile(nextProfile);
      setProfileNotice("saved");
    } catch {
      setProfileNotice("failure");
    } finally {
      profilePending.current = false;
      setProfileBusy(false);
    }
  }

  function cancelProfileEdits() {
    setProfile(savedProfile);
    setProfileNotice(null);
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(false);
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
      setPhotoError(true);
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setCropSource(reader.result);
      setCropScale(1);
      setCropX(0);
      setCropY(0);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function applyCrop() {
    if (!cropSource) return;
    const image = new window.Image();
    image.onload = () => {
      const output = document.createElement("canvas");
      output.width = 512;
      output.height = 512;
      const side = Math.min(image.naturalWidth, image.naturalHeight) / cropScale;
      const availableX = Math.max(0, image.naturalWidth - side);
      const availableY = Math.max(0, image.naturalHeight - side);
      const sourceX = Math.max(0, Math.min(availableX, availableX / 2 + (cropX / 50) * availableX));
      const sourceY = Math.max(0, Math.min(availableY, availableY / 2 + (cropY / 50) * availableY));
      const context = output.getContext("2d");
      if (!context) return;
      context.drawImage(image, sourceX, sourceY, side, side, 0, 0, output.width, output.height);
      setPhotoPreview(output.toDataURL("image/jpeg", .9));
      setCropSource(null);
    };
    image.src = cropSource;
  }

  function openMethod(method: LoginMethod) {
    setDialog(method);
    setMethodNotice(null);
    setMethodError(null);
    setShowPassword(false);
  }

  function openDelete() {
    setDeleteStep("warning");
    setDeleteNotice(false);
    setShowPassword(false);
    setDialog("delete");
  }

  function submitEmailSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const password = String(values.get("newPassword") || "");
    const confirmation = String(values.get("confirmPassword") || "");
    if (password.length < 15) { setMethodError("short"); return; }
    if (password !== confirmation) { setMethodError("mismatch"); return; }
    setMethodError(null);
    setMethodNotice("ready");
  }

  const connected = (method: LoginMethod) => profile.loginMethods.includes(method);
  const deleteMethod: LoginMethod = connected("google") ? "google" : connected("email") ? "email" : "bankid";
  const methodRows: { key: LoginMethod; title: string; detail: string; icon: typeof Mail }[] = [
    { key: "email", title: t.emailMethod, detail: t.emailMethodDetail, icon: Mail },
    { key: "google", title: "Google", detail: t.googleDetail, icon: Globe2 },
    { key: "bankid", title: "BankID", detail: t.bankIdDetail, icon: ScanFace },
  ];

  function closeDialog() {
    setDialog(null);
    setMethodNotice(null);
    setMethodError(null);
    setDeleteNotice(false);
  }

  return <div className={styles.accountSettings}>
    <form className={styles.accountProfileForm} onSubmit={submitProfile} aria-busy={profileBusy}>
      <section className={`${styles.section} ${styles.accountSection}`}>
        <div className={styles.accountSectionHeading}><div><h2>{t.profile}</h2><p className={styles.sectionIntro}>{t.profileIntro}</p></div><UserRound size={20} aria-hidden="true" /></div>
        <div className={styles.profileIdentity}>
          <LocalAvatar preview={photoPreview} user={user} label={t.profile} />
          <div className={styles.profileIdentityCopy}><strong>{profile.fullName.trim() || user.email}</strong><span>{user.email}</span><button type="button" className={styles.secondary} onClick={() => fileInputRef.current?.click()}><Camera size={16} aria-hidden="true" />{t.changePhoto}</button><input ref={fileInputRef} className={styles.fileInput} type="file" accept="image/*" onChange={choosePhoto} aria-label={t.choosePhoto} /></div>
        </div>
        {photoError && <p className={styles.formError} role="alert">{t.photoError}</p>}
        {photoPreview && <p className={styles.localNotice} role="status"><Check size={15} aria-hidden="true" />{t.photoPreview}</p>}
        <div className={styles.formGrid}>
          <Field label={t.fullName}><input autoComplete="name" maxLength={160} value={profile.fullName} onChange={event => patch({ fullName: event.target.value })} /></Field>
          <Field label={t.email}><input type="email" dir="ltr" value={user.email} readOnly /></Field>
          <Field label={t.customerType}><select value={profile.customerType || ""} onChange={event => patch({ customerType: (event.target.value || null) as Profile["customerType"] })}><option value="">{t.unspecified}</option><option value="private">{t.private}</option><option value="company">{t.company}</option></select></Field>
          {profile.customerType === "company" && <><Field label={t.companyName}><input autoComplete="organization" maxLength={180} value={profile.companyName} onChange={event => patch({ companyName: event.target.value })} /></Field><Field label={t.companyNumber}><input maxLength={80} value={profile.companyNumber} onChange={event => patch({ companyNumber: event.target.value })} /></Field></>}
        </div>
        <p className={styles.muted}>{t.emailNote}</p><p className={styles.identifier}>{t.accountId}: <bdi>{user.id}</bdi></p>
        <div className={styles.saveRow}><button type="submit" className={styles.primary} disabled={profileBusy}><KeyRound size={16} aria-hidden="true" />{profileBusy ? t.saving : t.saveChanges}</button><button type="button" className={styles.secondary} onClick={cancelProfileEdits} disabled={profileBusy}>{t.cancel}</button><p role={profileNotice === "failure" || profileNotice === "nameRequired" ? "alert" : "status"}>{profileNotice ? t[profileNotice] : ""}</p></div>
      </section>
    </form>

    <section className={`${styles.section} ${styles.accountSection}`}>
      <div className={styles.accountSectionHeading}><div><h2>{t.methods}</h2><p className={styles.sectionIntro}>{t.methodsIntro}</p></div><Link2 size={20} aria-hidden="true" /></div>
      <div className={styles.methodList}>{methodRows.map(({ key, title, detail, icon: Icon }) => <div className={styles.methodRow} key={key}>
        <span className={styles.methodIcon}><Icon size={19} aria-hidden="true" /></span><span className={styles.methodCopy}><strong>{title}</strong><small>{detail}</small></span><span className={`${styles.statusTag} ${connected(key) ? styles.statusLinked : ""}`}><span className={styles.statusDot} aria-hidden="true" />{connected(key) ? t.linked : t.notLinked}</span>{!connected(key) && <button type="button" className={styles.linkButton} onClick={() => openMethod(key)}>{t.link}</button>}{connected(key) && key === "email" && <button type="button" className={styles.linkButton} onClick={() => openMethod(key)}>{t.manage}</button>}
      </div>)}</div>
    </section>

    <SecuritySettings locale={locale} passwordLogin={profile.loginMethods.includes("email")} />

    <section className={`${styles.section} ${styles.accountSection}`}>
      <div className={styles.accountSectionHeading}><div><h2>{t.notifications}</h2><p className={styles.sectionIntro}>{t.notificationsIntro}</p></div><ShieldCheck size={20} aria-hidden="true" /></div>
      <div className={styles.preferenceList}>{(["project", "team", "billing", "email"] as const).map((key) => { const labels = { project: [t.projectNotices, t.projectNoticesDetail], team: [t.teamNotices, t.teamNoticesDetail], billing: [t.billingNotices, t.billingNoticesDetail], email: [t.emailNotices, t.emailNoticesDetail] }[key]; return <label className={styles.preferenceRow} key={key}><span><strong>{labels[0]}</strong><small>{labels[1]}</small></span><input type="checkbox" role="switch" aria-label={labels[0]} checked={preferences[key]} onChange={event => setPreferences(current => ({ ...current, [key]: event.target.checked }))} /></label>; })}</div>
      <p className={styles.localNotice} role="status"><Check size={15} aria-hidden="true" />{t.preferenceUpdated}</p>
    </section>

    <section className={`${styles.section} ${styles.accountSection} ${styles.accountActionsSection}`}>
      <div className={styles.accountSectionHeading}><div><h2>{t.actions}</h2><p className={styles.sectionIntro}>{t.deleteIntro}</p></div><Trash2 size={20} aria-hidden="true" /></div>
      <div className={styles.actions}><button type="button" onClick={signOut} disabled={signingOut}>{t.signOut}</button><button type="button" className={styles.dangerButton} onClick={openDelete}><Trash2 size={16} aria-hidden="true" />{t.deleteAccount}</button></div>
    </section>

    {cropSource && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCropSource(null); }}><div className={styles.settingsModal} role="dialog" aria-modal="true" aria-labelledby="crop-dialog-title"><div className={styles.modalHeading}><div><h2 id="crop-dialog-title">{t.cropPhoto}</h2><p>{t.cropHint}</p></div><button type="button" className={styles.iconButton} onClick={() => setCropSource(null)} aria-label={t.close}><X size={18} /></button></div><div className={styles.cropViewport}><img src={cropSource} alt="" style={{ transform: `scale(${cropScale}) translate(${cropX}%, ${cropY}%)` }} /></div><div className={styles.cropControls}><label><span>{t.zoom}</span><input type="range" min="1" max="2" step=".01" value={cropScale} onChange={event => setCropScale(Number(event.target.value))} /></label><label><span>{t.horizontal}</span><input type="range" min="-25" max="25" value={cropX} onChange={event => setCropX(Number(event.target.value))} /></label><label><span>{t.vertical}</span><input type="range" min="-25" max="25" value={cropY} onChange={event => setCropY(Number(event.target.value))} /></label></div><div className={styles.modalActions}><button type="button" className={styles.secondary} onClick={() => setCropSource(null)}>{t.cancel}</button><button type="button" className={styles.primary} onClick={applyCrop}><Check size={16} />{t.savePhoto}</button></div></div></div>}

    {dialog && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}><div className={styles.settingsModal} role="dialog" aria-modal="true" aria-labelledby="settings-dialog-title">
      <div className={styles.modalHeading}><div><h2 id="settings-dialog-title">{dialog === "delete" ? (deleteStep === "warning" ? t.deleteAccount : t.confirmIdentity) : dialog === "email" ? t.emailSetup : dialog === "google" ? "Google" : "BankID"}</h2><p>{dialog === "delete" ? (deleteStep === "warning" ? t.deleteWarning : t.confirmIdentityIntro) : dialog === "email" ? t.emailSetupIntro : dialog === "google" ? t.googleDetail : t.bankIdDetail}</p></div><button type="button" className={styles.iconButton} onClick={closeDialog} aria-label={t.close}><X size={18} /></button></div>
      {dialog === "delete" && deleteStep === "warning" && <><div className={styles.warningPanel}><Trash2 size={20} aria-hidden="true" /><p>{t.deleteWarning}</p></div><p className={styles.modalNote}>{t.finalConfirmationLater}</p><div className={styles.modalActions}><button type="button" className={styles.secondary} onClick={closeDialog}>{t.cancel}</button><button type="button" className={styles.dangerButton} onClick={() => setDeleteStep("verify")}>{t.continue}</button></div></>}
      {dialog === "delete" && deleteStep === "verify" && <div className={styles.verifyPanel}>{deleteMethod === "google" && <button type="button" className={styles.primary} onClick={() => setDeleteNotice(true)}><Globe2 size={17} />{t.confirmWithGoogle}</button>}{deleteMethod === "bankid" && <button type="button" className={styles.primary} onClick={() => setDeleteNotice(true)}><ScanFace size={17} />{t.confirmWithBankId}</button>}{deleteMethod === "email" && <form onSubmit={(event) => { event.preventDefault(); setDeleteNotice(true); }}><label className={styles.field}><span>{t.password}</span><span className={styles.passwordInput}><input type={showPassword ? "text" : "password"} required autoComplete="current-password" /><button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? t.hidePassword : t.showPassword}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label><button type="submit" className={styles.primary}><KeyRound size={17} />{t.confirmWithPassword}</button></form>}{deleteNotice && <p className={styles.localNotice} role="status"><Check size={15} />{t.finalConfirmationLater}</p>}<div className={styles.modalActions}><button type="button" className={styles.secondary} onClick={closeDialog}>{t.cancel}</button></div></div>}
      {dialog !== "delete" && dialog === "email" && <form className={styles.modalForm} onSubmit={submitEmailSetup}><Field label={t.currentEmail}><input type="email" dir="ltr" value={user.email} readOnly /></Field><Field label={t.newPassword}><input name="newPassword" type="password" autoComplete="new-password" minLength={15} required /></Field><Field label={t.confirmPassword}><input name="confirmPassword" type="password" autoComplete="new-password" minLength={15} required /></Field>{methodError && <p className={styles.formError} role="alert">{methodError === "short" ? t.passwordShort : t.passwordMismatch}</p>}{methodNotice && <p className={styles.localNotice} role="status"><Check size={15} />{methodNotice === "ready" ? t.connectionReady : t.notConnectedYet}</p>}<div className={styles.modalActions}><button type="button" className={styles.secondary} onClick={closeDialog}>{t.cancel}</button><button type="submit" className={styles.primary}><KeyRound size={16} />{t.prepareLink}</button></div></form>}
      {dialog !== "delete" && dialog === "google" && <div className={styles.verifyPanel}><button type="button" className={styles.primary} onClick={() => setMethodNotice("notConnected")}><Globe2 size={17} />{t.continueGoogle}</button>{methodNotice && <p className={styles.localNotice} role="status"><Check size={15} />{t.notConnectedYet}</p>}<div className={styles.modalActions}><button type="button" className={styles.secondary} onClick={closeDialog}>{t.cancel}</button></div></div>}
      {dialog !== "delete" && dialog === "bankid" && <div className={styles.verifyPanel}><button type="button" className={styles.primary} onClick={() => setMethodNotice("notConnected")}><ScanFace size={17} />{t.startBankId}</button>{methodNotice && <p className={styles.localNotice} role="status"><Check size={15} />{t.notConnectedYet}</p>}<div className={styles.modalActions}><button type="button" className={styles.secondary} onClick={closeDialog}>{t.cancel}</button></div></div>}
    </div></div>}
  </div>;
}
