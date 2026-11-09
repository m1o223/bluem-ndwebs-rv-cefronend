"use client";

import { ArrowLeft, Clock3, Mail, Send } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Locale } from "../localization-provider";
import styles from "./customer.module.css";

type DemoMessage = { id: string; sender: "team" | "customer"; body: string; time: string };
type DemoThread = { id: string; title: string; preview: string; time: string; unread: boolean; messages: DemoMessage[] };

const content: Record<Locale, { title: string; select: string; back: string; demo: string; empty: string; reply: string; send: string; placeholder: string; now: string; threads: DemoThread[] }> = {
  en: {
    title: "Notifications & messages", select: "Select a message to open the conversation", back: "Back to messages", demo: "Demo conversation", empty: "No conversation selected", reply: "Thanks for your message. This local demo reply is here to preview the conversation layout. Real team replies and message syncing will be connected later.", send: "Send", placeholder: "Write a demo reply...", now: "Just now",
    threads: [
      { id: "direction", title: "Design direction updated", preview: "Your project is ready for the next review.", time: "Today, 10:42", unread: true, messages: [{ id: "direction-1", sender: "team", body: "Your design direction is ready for the next review. Please open My Project when you are ready to share your feedback.", time: "Today, 10:42" }] },
      { id: "welcome", title: "Welcome to BlueMind Web Service", preview: "We are ready to help you shape your website idea.", time: "Yesterday", unread: false, messages: [{ id: "welcome-1", sender: "team", body: "Welcome to BlueMind Web Service. We are ready to help you shape your idea and organize the next steps for your project.", time: "Yesterday" }] },
      { id: "review", title: "Final review reminder", preview: "Your project review is waiting for your feedback.", time: "Mon, 14:18", unread: true, messages: [{ id: "review-1", sender: "team", body: "Your final review is ready. Send us any notes and we will keep them with your project details.", time: "Mon, 14:18" }] },
    ],
  },
  sv: {
    title: "Aviseringar och meddelanden", select: "Välj ett meddelande för att öppna konversationen", back: "Tillbaka till meddelanden", demo: "Demokonversation", empty: "Ingen konversation vald", reply: "Tack för ditt meddelande. Detta lokala demosvar visar hur konversationen fungerar. Riktiga teamsvar och synkronisering kopplas in senare.", send: "Skicka", placeholder: "Skriv ett demosvar...", now: "Just nu",
    threads: [
      { id: "direction", title: "Designriktningen har uppdaterats", preview: "Ditt projekt är redo för nästa granskning.", time: "Idag, 10:42", unread: true, messages: [{ id: "direction-1", sender: "team", body: "Din designriktning är redo för nästa granskning. Öppna Mitt projekt när du vill lämna feedback.", time: "Idag, 10:42" }] },
      { id: "welcome", title: "Välkommen till BlueMind Web Service", preview: "Vi hjälper dig gärna att forma din webbplatsidé.", time: "Igår", unread: false, messages: [{ id: "welcome-1", sender: "team", body: "Välkommen till BlueMind Web Service. Vi hjälper dig att forma din idé och organisera nästa steg i projektet.", time: "Igår" }] },
      { id: "review", title: "Påminnelse om slutgranskning", preview: "Din projektgranskning väntar på din feedback.", time: "Mån, 14:18", unread: true, messages: [{ id: "review-1", sender: "team", body: "Din slutgranskning är redo. Skicka dina kommentarer så sparar vi dem tillsammans med projektets detaljer.", time: "Mån, 14:18" }] },
    ],
  },
  ar: {
    title: "الإشعارات والرسائل", select: "اختر رسالة لفتح المحادثة", back: "العودة إلى الرسائل", demo: "محادثة تجريبية", empty: "لم يتم اختيار محادثة", reply: "شكرًا لرسالتك. هذا رد تجريبي محلي لعرض شكل المحادثة. ستتم إضافة الردود الحقيقية ومزامنة الرسائل لاحقًا.", send: "إرسال", placeholder: "اكتب ردًا تجريبيًا...", now: "الآن",
    threads: [
      { id: "direction", title: "تم تحديث اتجاه التصميم", preview: "مشروعك جاهز للمراجعة التالية.", time: "اليوم، 10:42", unread: true, messages: [{ id: "direction-1", sender: "team", body: "أصبح اتجاه التصميم جاهزًا للمراجعة التالية. افتح صفحة مشروعي عندما تكون مستعدًا لإرسال ملاحظاتك.", time: "اليوم، 10:42" }] },
      { id: "welcome", title: "أهلًا بك في BlueMind Web Service", preview: "نحن جاهزون لمساعدتك في ترتيب فكرة موقعك.", time: "أمس", unread: false, messages: [{ id: "welcome-1", sender: "team", body: "أهلًا بك في BlueMind Web Service. نحن جاهزون لمساعدتك في ترتيب فكرتك وتنظيم الخطوات التالية لمشروعك.", time: "أمس" }] },
      { id: "review", title: "تذكير بالمراجعة النهائية", preview: "مراجعة مشروعك بانتظار ملاحظاتك.", time: "الاثنين، 14:18", unread: true, messages: [{ id: "review-1", sender: "team", body: "المراجعة النهائية جاهزة. أرسل ملاحظاتك وسنحتفظ بها مع تفاصيل مشروعك.", time: "الاثنين، 14:18" }] },
    ],
  },
};

export default function NotificationsMessages({ locale }: { locale: Locale }) {
  const t = content[locale];
  const threads = t.threads;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Record<string, DemoMessage[]>>(() => Object.fromEntries(threads.map(thread => [thread.id, thread.messages])));
  const active = useMemo(() => threads.find(thread => thread.id === selectedId) || null, [selectedId, threads]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)").matches;
    setSelectedId(desktop ? threads[0]?.id || null : null);
    setDraft("");
    setMessages(Object.fromEntries(threads.map(thread => [thread.id, thread.messages])));
  }, [locale, threads]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId) return;
    const reply: DemoMessage = { id: `${selectedId}-${Date.now()}-reply`, sender: "team", body: t.reply, time: t.now };
    setMessages(previous => ({ ...previous, [selectedId]: [...(previous[selectedId] || []), { id: `${selectedId}-${Date.now()}`, sender: "customer", body, time: t.now }, reply] }));
    setDraft("");
  }

  return <section className={styles.messagesPage} aria-label={t.title}>
    <div className={styles.messageWorkspace}>
      <section className={styles.messageList} data-hidden={selectedId ? "true" : "false"} aria-label={t.title}>
        <div className={styles.messageListHeading}><div><p className={styles.eyebrow}>BlueMind Web Service</p><h2>{t.title}</h2></div><Mail size={22} aria-hidden="true" /></div>
        <p className={styles.messageHint}>{t.select}</p>
        <div className={styles.threadList}>
          {threads.map(thread => <button key={thread.id} type="button" className={styles.thread} data-selected={selectedId === thread.id} onClick={() => { setSelectedId(thread.id); setDraft(""); }}>
            <span className={styles.threadTop}><strong>{thread.title}</strong>{thread.unread && <span className={styles.unreadLabel}>New</span>}</span>
            <span className={styles.threadPreview}>{thread.preview}</span>
            <time>{thread.time}</time>
          </button>)}
        </div>
      </section>
      <section className={styles.conversation} data-visible={Boolean(active)} aria-label={active?.title || t.empty}>
        {active ? <>
          <header className={styles.conversationHeader}><button type="button" className={`${styles.backToMessages} ${styles.secondary}`} onClick={() => setSelectedId(null)}><ArrowLeft size={17} aria-hidden="true" />{t.back}</button><div><h2>{active.title}</h2><span className={styles.demoBadge}>{t.demo}</span></div></header>
          <div className={styles.conversationMessages} aria-live="polite">{(messages[active.id] || []).map(message => <article key={message.id} className={styles.demoMessage} data-sender={message.sender}><p>{message.body}</p><time><Clock3 size={13} aria-hidden="true" />{message.time}</time></article>)}</div>
          <form className={styles.demoComposer} onSubmit={send}><label className={styles.srOnly} htmlFor="demo-message">{t.placeholder}</label><textarea id="demo-message" value={draft} onChange={event => setDraft(event.target.value)} placeholder={t.placeholder} rows={2} maxLength={2000} /><button className={styles.primary} type="submit" disabled={!draft.trim()}><Send size={17} aria-hidden="true" />{t.send}</button></form>
        </> : <div className={styles.conversationEmpty}><Mail size={30} strokeWidth={1.5} aria-hidden="true" /><p>{t.empty}</p></div>}
      </section>
    </div>
  </section>;
}
