"use client";

import {
  CreditCard,
  Database,
  FileLock2,
  FileText,
  FlagTriangleRight,
  KeyRound,
  LockKeyhole,
  Monitor,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useLocalization, type Locale } from "../../components/localization-provider";
import styles from "./security-page.module.css";

type SecurityCardCopy = { title: string; description: string };
type SecurityGroupCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cards: [SecurityCardCopy, SecurityCardCopy];
  illustration: "data" | "access" | "recovery";
};
type SecurityCopy = {
  eyebrow: string;
  title: string;
  description: string;
  groups: [SecurityGroupCopy, SecurityGroupCopy, SecurityGroupCopy];
};

const cardIcons: LucideIcon[][] = [
  [FileLock2, RotateCcw],
  [KeyRound, UserRoundCheck],
  [RefreshCw, FlagTriangleRight],
];

const copy: Record<Locale, SecurityCopy> = {
  en: {
    eyebrow: "Security",
    title: "Your website and data security",
    description: "Learn how we handle your data, the steps we are preparing to protect your website, and how to report a security concern.",
    groups: [
      {
        eyebrow: "Data and files",
        title: "Clarity around your data",
        description: "This area explains what data and files a project may receive through its forms, account areas, and project workflows. The exact storage provider, region, access rules, public-link behavior, retention period, and deletion boundaries depend on the connected implementation and service agreement. We keep those details explicit here instead of treating a front-end field as proof of a backend policy.",
        illustration: "data",
        cards: [
          { title: "Private files", description: "Access should be limited by the connected service and the account or project rules that are actually configured. The Test site does not confirm a public or private file policy, so sensitive files should not be shared here until the storage path is verified." },
          { title: "Retention and deletion", description: "Retention and deletion depend on the storage service and its backup policy. The Test front end does not currently provide a verified schedule or deletion request flow; those details need confirmation before publication." },
        ],
      },
      {
        eyebrow: "Accounts and permissions",
        title: "The right access for each role",
        description: "Permissions determine who can view project information, update content, or change settings. The application includes customer routes and session checks, but the connected backend decides the actual role model, session controls, and support access. This page separates what is visible in the interface from controls that still need verification.",
        illustration: "access",
        cards: [
          { title: "Sign-in protection", description: "The application includes server-managed customer session handling and a Google sign-in flow. Two-factor authentication and detailed session-management behavior are not verified here, so they are not presented as enabled features." },
          { title: "Support-team access", description: "Support access should be granted only when needed and limited to the project context being handled. The current repository does not expose a verified support-approval or impersonation workflow, so this preview does not claim one is active." },
        ],
      },
      {
        eyebrow: "Continuity and recovery",
        title: "Prepared for problems and recovery",
        description: "Continuity depends on the hosting, data, and support setup behind each project. The current frontend contains care and restore labels in demo flows, but it does not verify a production backup schedule, retention window, recovery process, or live monitoring path. Those controls must be confirmed before they become service promises.",
        illustration: "recovery",
        cards: [
          { title: "Updates and issue handling", description: "The project scope and care plan define which updates and maintenance work are included. This repository does not establish a universal maintenance SLA, so the final scope should be stated for each service and project." },
          { title: "Report a security concern", description: "Use the contact route and include the page URL, steps to reproduce, timing, and non-sensitive context. Do not send passwords, payment-card details, session tokens, or private keys in a report." },
        ],
      },
    ],
  },
  sv: {
    eyebrow: "Säkerhet",
    title: "Säkerheten för din webbplats och dina data",
    description: "Läs om hur vi hanterar dina data, vilka skyddsåtgärder vi förbereder för din webbplats och hur du rapporterar ett säkerhetsproblem.",
    groups: [
      {
        eyebrow: "Data och filer",
        title: "Tydlighet kring dina data",
        description: "Det här avsnittet förklarar vilka data och filer ett projekt kan ta emot via formulär, kontodelar och projektflöden. Exakt lagringsleverantör, region, åtkomstregler, offentliga länkar, lagringstid och gränser för radering beror på den anslutna implementationen och tjänsteavtalet. Vi håller dessa uppgifter tydliga i stället för att tolka ett fält i frontend som bevis på en backend-policy.",
        illustration: "data",
        cards: [
          { title: "Privata filer", description: "Åtkomst bör begränsas av den anslutna tjänsten och de konto- eller projektregler som faktiskt är konfigurerade. Testsidan bekräftar inte någon offentlig eller privat filpolicy, så dela inte känsliga filer här innan lagringsflödet har verifierats." },
          { title: "Lagringstid och radering", description: "Lagringstid och radering beror på lagringstjänsten och dess policy för säkerhetskopior. Test-frontend innehåller ännu inget verifierat schema eller flöde för raderingsbegäran; dessa uppgifter behöver bekräftas före publicering." },
        ],
      },
      {
        eyebrow: "Konton och behörigheter",
        title: "Rätt åtkomst för varje roll",
        description: "Behörigheter avgör vem som kan se projektinformation, uppdatera innehåll eller ändra inställningar. Applikationen innehåller kundrutter och sessionskontroller, men den anslutna backend-tjänsten avgör den faktiska rollmodellen, sessionshanteringen och supportåtkomsten. Sidan skiljer därför det som syns i gränssnittet från kontroller som ännu behöver verifieras.",
        illustration: "access",
        cards: [
          { title: "Skydd vid inloggning", description: "Applikationen innehåller serverhantering av kundsessioner och ett Google-inloggningsflöde. Tvåfaktorsautentisering och detaljerad sessionshantering är inte verifierade här och presenteras därför inte som aktiverade funktioner." },
          { title: "Supportteamets åtkomst", description: "Supportåtkomst bör bara ges när den behövs och begränsas till det projekt som hanteras. Det här kodprojektet visar inget verifierat godkännande- eller impersoneringsflöde för support, så testversionen påstår inte att ett sådant flöde är aktivt." },
        ],
      },
      {
        eyebrow: "Kontinuitet och återställning",
        title: "Förberedd för problem och återställning",
        description: "Kontinuitet beror på hosting-, data- och supportlösningen bakom varje projekt. Den nuvarande frontend innehåller etiketter för vård och återställning i demoflöden, men verifierar inte ett produktionsschema för säkerhetskopiering, en lagringstid, en återställningsprocess eller en aktiv övervakningsväg. Dessa kontroller måste bekräftas innan de blir tjänstelöften.",
        illustration: "recovery",
        cards: [
          { title: "Uppdateringar och felhantering", description: "Projektets omfattning och vårdplan avgör vilka uppdateringar och underhållsinsatser som ingår. Kodprojektet fastställer ingen generell SLA, så den slutliga omfattningen bör anges för varje tjänst och projekt." },
          { title: "Rapportera ett säkerhetsproblem", description: "Använd kontaktvägen och ange sidans URL, steg för att återskapa problemet, tidpunkt och icke-känslig bakgrund. Skicka inte lösenord, kortuppgifter, sessionstoken eller privata nycklar i en rapport." },
        ],
      },
    ],
  },
  ar: {
    eyebrow: "الأمان",
    title: "أمان موقعك وبياناتك",
    description: "تعرّف على كيفية التعامل مع بياناتك، وإجراءات حماية موقعك، وطريقة الإبلاغ عن المشكلات الأمنية.",
    groups: [
      {
        eyebrow: "البيانات والملفات",
        title: "وضوح في التعامل مع بياناتك",
        description: "يوضح هذا القسم أنواع البيانات والملفات التي قد يستقبلها المشروع عبر النماذج وأجزاء الحساب ومسارات العمل. يعتمد مزوّد التخزين والمنطقة وقواعد الوصول وسلوك الروابط العامة ومدة الاحتفاظ وحدود الحذف على التنفيذ المتصل واتفاقية الخدمة. لذلك نعرض هذه النقاط بوضوح، ولا نعتبر وجود حقل في الواجهة دليلاً على سياسة مطبّقة في الخلفية.",
        illustration: "data",
        cards: [
          { title: "خصوصية الملفات", description: "يفترض أن يقتصر الوصول على الخدمة المتصلة وقواعد الحساب أو المشروع المطبّقة فعلياً. لا تؤكد نسخة التست سياسة عامة أو خاصة للملفات، لذلك لا تشارك ملفات حساسة فيها قبل التحقق من مسار التخزين." },
          { title: "الاحتفاظ بالبيانات وحذفها", description: "تعتمد مدة الاحتفاظ والحذف على خدمة التخزين وسياسة النسخ الاحتياطية التابعة لها. لا تعرض واجهة التست حالياً جدولاً موثقاً أو مساراً مؤكداً لطلبات الحذف، وتحتاج هذه التفاصيل إلى تأكيد قبل النشر." },
        ],
      },
      {
        eyebrow: "الحسابات والصلاحيات",
        title: "الوصول المناسب لكل دور",
        description: "تحدد الصلاحيات من يستطيع رؤية معلومات المشروع أو تحديث المحتوى أو تغيير الإعدادات. يحتوي التطبيق على مسارات للعملاء وفحوصات للجلسة، لكن النظام الخلفي المتصل هو الذي يحدد نموذج الأدوار وإدارة الجلسات ووصول فريق الدعم فعلياً. يميّز هذا القسم بين ما يظهر في الواجهة وما يحتاج إلى تحقق إضافي.",
        illustration: "access",
        cards: [
          { title: "حماية تسجيل الدخول", description: "يتضمن التطبيق إدارة جلسة للعميل على الخادم ومساراً لتسجيل الدخول عبر Google. لم يتم التحقق هنا من المصادقة الثنائية أو تفاصيل إدارة الجلسات، لذلك لا نعرضهما كميزات مفعّلة." },
          { title: "وصول فريق الدعم", description: "ينبغي منح فريق الدعم وصولاً عند الحاجة فقط، وبقدر ما يرتبط بالمشروع الجاري التعامل معه. لا يظهر في المستودع الحالي مسار موثق للموافقة على وصول الدعم أو انتحال جلسة العميل، لذلك لا تدّعي نسخة التست تفعيله." },
        ],
      },
      {
        eyebrow: "استمرارية الموقع والاستعادة",
        title: "استعداد للتعامل مع المشكلات والاستعادة",
        description: "تعتمد الاستمرارية على إعدادات الاستضافة والبيانات والدعم الخاصة بكل مشروع. تحتوي الواجهة الحالية على تسميات للرعاية والاستعادة ضمن تدفقات تجريبية، لكنها لا تثبت جدولاً فعلياً للنسخ الاحتياطي أو مدة الاحتفاظ أو آلية الاستعادة أو مسار مراقبة حي. يجب تأكيد هذه الضوابط قبل تحويلها إلى التزامات للخدمة.",
        illustration: "recovery",
        cards: [
          { title: "التحديثات ومعالجة المشكلات", description: "يحدد نطاق المشروع وخطة الرعاية نوع التحديثات وأعمال الصيانة المشمولة. لا يحدد هذا المستودع مدة استجابة عامة ملزمة، لذلك يجب توضيح النطاق النهائي لكل خدمة ومشروع على حدة." },
          { title: "الإبلاغ عن مشكلة أمنية", description: "استخدم وسيلة التواصل وأرسل رابط الصفحة وخطوات إعادة المشكلة ووقتها ومعلومات غير حساسة عنها. لا ترسل كلمات المرور أو بيانات البطاقات أو رموز الجلسات أو المفاتيح الخاصة ضمن البلاغ." },
        ],
      },
    ],
  },
};

function DataIllustration() {
  return <div className={`${styles.diagram} ${styles.dataDiagram}`} aria-hidden="true">
    <span className={styles.diagramGlow} />
    <span className={`${styles.diagramLine} ${styles.dataLineOne}`} />
    <span className={`${styles.diagramLine} ${styles.dataLineTwo}`} />
    <span className={styles.storageBlock}>
      <span className={styles.storageTop}><Database size={26} strokeWidth={1.5} /></span>
      <span className={styles.storageRow}><FileText size={19} strokeWidth={1.5} /><i /></span>
      <span className={styles.storageRow}><FileText size={19} strokeWidth={1.5} /><i /></span>
      <span className={styles.storageRow}><FileText size={19} strokeWidth={1.5} /><i /></span>
    </span>
    <span className={`${styles.diagramBadge} ${styles.diagramBadgePrimary}`}><ShieldCheck size={31} strokeWidth={1.5} /></span>
    <span className={`${styles.diagramBadge} ${styles.diagramBadgeSecondary}`}><LockKeyhole size={25} strokeWidth={1.5} /></span>
  </div>;
}

function AccessIllustration() {
  return <div className={`${styles.diagram} ${styles.accessDiagram}`} aria-hidden="true">
    <span className={styles.diagramGlow} />
    <span className={`${styles.accessLine} ${styles.accessLineOne}`} />
    <span className={`${styles.accessLine} ${styles.accessLineTwo}`} />
    <span className={`${styles.accessLine} ${styles.accessLineThree}`} />
    <span className={`${styles.accessNode} ${styles.accessHub}`}><UserRound size={35} strokeWidth={1.45} /></span>
    <span className={`${styles.accessNode} ${styles.accessNodeOne}`}><KeyRound size={24} strokeWidth={1.45} /></span>
    <span className={`${styles.accessNode} ${styles.accessNodeTwo}`}><UserRoundCheck size={24} strokeWidth={1.45} /></span>
    <span className={`${styles.accessNode} ${styles.accessNodeThree}`}><EyeIcon size={24} strokeWidth={1.45} /></span>
  </div>;
}

function EyeIcon(props: { size: number; strokeWidth: number }) {
  return <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M2.1 12s3.5-6 9.9-6 9.9 6 9.9 6-3.5 6-9.9 6-9.9-6-9.9-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

function RecoveryIllustration() {
  return <div className={`${styles.diagram} ${styles.recoveryDiagram}`} aria-hidden="true">
    <span className={styles.diagramGlow} />
    <span className={styles.screenFrame}><Monitor size={66} strokeWidth={1.35} /><span className={styles.screenBars}><i /><i /><i /></span></span>
    <span className={`${styles.recoveryLine} ${styles.recoveryLineOne}`} />
    <span className={`${styles.recoveryLine} ${styles.recoveryLineTwo}`} />
    <span className={styles.recoveryArrow}><RefreshCw size={42} strokeWidth={1.35} /></span>
    <span className={styles.backupBlock}><Database size={35} strokeWidth={1.35} /><span><i /><i /><i /></span></span>
    <span className={styles.recoveryPoint}><span /></span>
  </div>;
}

function GroupIllustration({ kind }: { kind: SecurityGroupCopy["illustration"] }) {
  if (kind === "data") return <DataIllustration />;
  if (kind === "access") return <AccessIllustration />;
  return <RecoveryIllustration />;
}

export default function SecurityPage() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <main className={styles.page} dir={direction} data-no-translate data-security-page="true">
      <section className={styles.hero} aria-labelledby="security-title">
        <div className={styles.heroVisual} aria-hidden="true">
          <Image
            className={styles.securityLogo}
            src="/images/security/blue-shield.png"
            alt=""
            width={1280}
            height={1280}
            priority
          />
        </div>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h1 id="security-title">{text.title}</h1>
          <p className={styles.description}>{text.description}</p>
        </div>
      </section>

      <section className={styles.groupsSection} aria-label={text.eyebrow}>
        {text.groups.map((group, groupIndex) => (
          <section className={styles.securityGroup} key={group.title} aria-labelledby={`security-group-${groupIndex}`}>
            <div className={styles.groupMain}>
              <div className={styles.groupCopy}>
                <p className={styles.groupEyebrow}>{group.eyebrow}</p>
                <h2 id={`security-group-${groupIndex}`}>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <div className={styles.groupIllustration}><GroupIllustration kind={group.illustration} /></div>
            </div>
            <div className={styles.supportCards}>
              {group.cards.map((card, cardIndex) => {
                const Icon = cardIcons[groupIndex][cardIndex];
                return <article className={styles.supportCard} key={card.title}>
                  <div className={styles.supportCardIcon}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></div>
                  <div><h3>{card.title}</h3><p>{card.description}</p></div>
                </article>;
              })}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
