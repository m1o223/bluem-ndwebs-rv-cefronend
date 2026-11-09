"use client";

import { ArrowLeft, Clock3, Mail, Mic, Play, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Locale } from "../localization-provider";
import styles from "./customer.module.css";

type DemoMessage = {
  id: string;
  sender: "team" | "customer";
  body?: string;
  time: string;
  kind?: "text" | "audio";
  audioUrl?: string;
  duration?: number;
};

type DemoThread = {
  id: string;
  title: string;
  preview: string;
  time: string;
  unread: boolean;
  avatar: string;
  sortOrder: number;
  messages: DemoMessage[];
};

type Copy = {
  title: string;
  select: string;
  back: string;
  demo: string;
  empty: string;
  reply: string;
  send: string;
  placeholder: string;
  now: string;
  newLabel: string;
  voice: string;
  recording: string;
  stop: string;
  cancel: string;
  sendVoice: string;
  deleteVoice: string;
  micUnsupported: string;
  micDenied: string;
  sentVoice: string;
  threads: DemoThread[];
};

const content: Record<Locale, Copy> = {
  en: {
    title: "Notifications & messages", select: "Choose a conversation to open it", back: "Back to messages", demo: "Front-end demo", empty: "Select a conversation to open it", reply: "Thanks for your message. This local demo reply previews the conversation experience. Real team replies and message syncing will be connected later.", send: "Send", placeholder: "Write a message...", now: "Just now", newLabel: "New", voice: "Voice message", recording: "Recording", stop: "Stop recording", cancel: "Cancel", sendVoice: "Send voice message", deleteVoice: "Delete voice message", micUnsupported: "Microphone recording is not supported in this browser.", micDenied: "Microphone access was not granted. You can still send a text message.", sentVoice: "Voice message",
    threads: [
      { id: "direction", title: "Design direction updated", preview: "Your project is ready for the next review.", time: "Today, 10:42", unread: true, avatar: "BM", sortOrder: 4, messages: [{ id: "direction-1", sender: "team", body: "Your design direction is ready for the next review. Please open My Project when you are ready to share your feedback.", time: "Today, 10:42" }] },
      { id: "welcome", title: "BlueMind Team", preview: "Welcome to BlueMind Web Service.", time: "Yesterday", unread: false, avatar: "B", sortOrder: 3, messages: [{ id: "welcome-1", sender: "team", body: "Welcome to BlueMind Web Service. We are ready to help you shape your idea and organize the next steps for your project.", time: "Yesterday" }] },
      { id: "review", title: "Final review reminder", preview: "Your project review is waiting for your feedback.", time: "Mon, 14:18", unread: true, avatar: "FR", sortOrder: 2, messages: [{ id: "review-1", sender: "team", body: "Your final review is ready. Send us any notes and we will keep them with your project details.", time: "Mon, 14:18" }] },
      { id: "care", title: "BlueMind Care", preview: "Your website care update is available.", time: "Sun, 09:15", unread: false, avatar: "C", sortOrder: 1, messages: [{ id: "care-1", sender: "team", body: "Your monthly BlueMind Care update is available. Let us know if you would like to review anything with the team.", time: "Sun, 09:15" }] },
    ],
  },
  sv: {
    title: "Aviseringar och meddelanden", select: "Välj en konversation för att öppna den", back: "Tillbaka till meddelanden", demo: "Frontend-demo", empty: "Välj en konversation för att öppna den", reply: "Tack för ditt meddelande. Detta lokala demosvar visar hur konversationen fungerar. Riktiga teamsvar och synkronisering kopplas in senare.", send: "Skicka", placeholder: "Skriv ett meddelande...", now: "Just nu", newLabel: "Ny", voice: "Röstmeddelande", recording: "Spelar in", stop: "Stoppa inspelning", cancel: "Avbryt", sendVoice: "Skicka röstmeddelande", deleteVoice: "Ta bort röstmeddelande", micUnsupported: "Röstinspelning stöds inte i den här webbläsaren.", micDenied: "Mikrofonåtkomst godkändes inte. Du kan fortfarande skicka ett textmeddelande.", sentVoice: "Röstmeddelande",
    threads: [
      { id: "direction", title: "Designriktningen har uppdaterats", preview: "Ditt projekt är redo för nästa granskning.", time: "Idag, 10:42", unread: true, avatar: "BM", sortOrder: 4, messages: [{ id: "direction-1", sender: "team", body: "Din designriktning är redo för nästa granskning. Öppna Mitt projekt när du vill lämna feedback.", time: "Idag, 10:42" }] },
      { id: "welcome", title: "BlueMind-teamet", preview: "Välkommen till BlueMind Web Service.", time: "Igår", unread: false, avatar: "B", sortOrder: 3, messages: [{ id: "welcome-1", sender: "team", body: "Välkommen till BlueMind Web Service. Vi hjälper dig att forma din idé och organisera nästa steg i projektet.", time: "Igår" }] },
      { id: "review", title: "Påminnelse om slutgranskning", preview: "Din projektgranskning väntar på din feedback.", time: "Mån, 14:18", unread: true, avatar: "FR", sortOrder: 2, messages: [{ id: "review-1", sender: "team", body: "Din slutgranskning är redo. Skicka dina kommentarer så sparar vi dem tillsammans med projektets detaljer.", time: "Mån, 14:18" }] },
      { id: "care", title: "BlueMind Care", preview: "Din uppdatering för webbplatsens skötsel är klar.", time: "Sön, 09:15", unread: false, avatar: "C", sortOrder: 1, messages: [{ id: "care-1", sender: "team", body: "Din månatliga BlueMind Care-uppdatering är klar. Hör av dig om du vill gå igenom något med teamet.", time: "Sön, 09:15" }] },
    ],
  },
  ar: {
    title: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644", select: "\u0627\u062e\u062a\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 \u0644\u0641\u062a\u062d\u0647\u0627", back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0631\u0633\u0627\u0626\u0644", demo: "\u062a\u062c\u0631\u0628\u0629 \u0648\u0627\u062c\u0647\u0629 \u0623\u0645\u0627\u0645\u064a\u0629", empty: "\u0627\u062e\u062a\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 \u0644\u0641\u062a\u062d\u0647\u0627", reply: "\u0634\u0643\u0631\u064b\u0627 \u0644\u0631\u0633\u0627\u0644\u062a\u0643. \u0647\u0630\u0627 \u0631\u062f \u062a\u062c\u0631\u064a\u0628\u064a \u0645\u062d\u0644\u064a \u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629. \u0633\u064a\u062a\u0645 \u0631\u0628\u0637 \u0631\u062f\u0648\u062f \u0627\u0644\u0641\u0631\u064a\u0642 \u0627\u0644\u062d\u0642\u064a\u0642\u064a\u0629 \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0644\u0627\u062d\u0642\u064b\u0627.", send: "\u0625\u0631\u0633\u0627\u0644", placeholder: "\u0627\u0643\u062a\u0628 \u0631\u0633\u0627\u0644\u0629...", now: "\u0627\u0644\u0622\u0646", newLabel: "\u062c\u062f\u064a\u062f", voice: "\u0631\u0633\u0627\u0644\u0629 \u0635\u0648\u062a\u064a\u0629", recording: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u0633\u062c\u064a\u0644", stop: "\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u062a\u0633\u062c\u064a\u0644", cancel: "\u0625\u0644\u063a\u0627\u0621", sendVoice: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u062a\u064a\u0629", deleteVoice: "\u062d\u0630\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u062a\u064a\u0629", micUnsupported: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0635\u0648\u062a \u063a\u064a\u0631 \u0645\u062f\u0639\u0648\u0645 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0645\u062a\u0635\u0641\u062d.", micDenied: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0633\u0645\u0627\u062d \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646. \u064a\u0645\u0643\u0646\u0643 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0646\u0635\u064a\u0629.", sentVoice: "\u0631\u0633\u0627\u0644\u0629 \u0635\u0648\u062a\u064a\u0629",
    threads: [
      { id: "direction", title: "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u062a\u0635\u0645\u064a\u0645", preview: "\u0645\u0634\u0631\u0648\u0639\u0643 \u062c\u0627\u0647\u0632 \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629.", time: "\u0627\u0644\u064a\u0648\u0645\u060c 10:42", unread: true, avatar: "BM", sortOrder: 4, messages: [{ id: "direction-1", sender: "team", body: "\u0623\u0635\u0628\u062d \u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u062a\u0635\u0645\u064a\u0645 \u062c\u0627\u0647\u0632\u064b\u0627 \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629. \u0627\u0641\u062a\u062d \u0635\u0641\u062d\u0629 \u0645\u0634\u0631\u0648\u0639\u064a \u0639\u0646\u062f\u0645\u0627 \u062a\u0643\u0648\u0646 \u0645\u0633\u062a\u0639\u062f\u064b\u0627 \u0644\u0625\u0631\u0633\u0627\u0644 \u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643.", time: "\u0627\u0644\u064a\u0648\u0645\u060c 10:42" }] },
      { id: "welcome", title: "\u0641\u0631\u064a\u0642 BlueMind", preview: "\u0623\u0647\u0644\u064b\u0627 \u0628\u0643 \u0641\u064a BlueMind Web Service.", time: "\u0623\u0645\u0633", unread: false, avatar: "B", sortOrder: 3, messages: [{ id: "welcome-1", sender: "team", body: "\u0623\u0647\u0644\u064b\u0627 \u0628\u0643 \u0641\u064a BlueMind Web Service. \u0646\u062d\u0646 \u062c\u0627\u0647\u0632\u0648\u0646 \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0641\u064a \u062a\u0631\u062a\u064a\u0628 \u0641\u0643\u0631\u062a\u0643 \u0648\u062a\u0646\u0638\u064a\u0645 \u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u062a\u0627\u0644\u064a\u0629 \u0644\u0645\u0634\u0631\u0648\u0639\u0643.", time: "\u0623\u0645\u0633" }] },
      { id: "review", title: "\u062a\u0630\u0643\u064a\u0631 \u0628\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064a\u0629", preview: "\u0645\u0631\u0627\u062c\u0639\u0629 \u0645\u0634\u0631\u0648\u0639\u0643 \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643.", time: "\u0627\u0644\u0627\u062b\u0646\u064a\u0646\u060c 14:18", unread: true, avatar: "FR", sortOrder: 2, messages: [{ id: "review-1", sender: "team", body: "\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064a\u0629 \u062c\u0627\u0647\u0632\u0629. \u0623\u0631\u0633\u0644 \u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643 \u0648\u0633\u0646\u062d\u062a\u0641\u0638 \u0628\u0647\u0627 \u0645\u0639 \u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0634\u0631\u0648\u0639\u0643.", time: "\u0627\u0644\u0627\u062b\u0646\u064a\u0646\u060c 14:18" }] },
      { id: "care", title: "BlueMind Care", preview: "\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0639\u0646\u0627\u064a\u0629 \u0628\u0645\u0648\u0642\u0639\u0643 \u062c\u0627\u0647\u0632.", time: "\u0627\u0644\u0623\u062d\u062f\u060c 09:15", unread: false, avatar: "C", sortOrder: 1, messages: [{ id: "care-1", sender: "team", body: "\u062a\u062d\u062f\u064a\u062b BlueMind Care \u0627\u0644\u0634\u0647\u0631\u064a \u062c\u0627\u0647\u0632. \u0623\u062e\u0628\u0631\u0646\u0627 \u0625\u0630\u0627 \u0623\u0631\u062f\u062a \u0645\u0631\u0627\u062c\u0639\u0629 \u0623\u064a \u0634\u064a\u0621 \u0645\u0639 \u0627\u0644\u0641\u0631\u064a\u0642.", time: "\u0627\u0644\u0623\u062d\u062f\u060c 09:15" }] },
    ],
  },
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function NotificationsMessages({ locale }: { locale: Locale }) {
  const t = content[locale];
  const threads = t.threads;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Record<string, DemoMessage[]>>(() => Object.fromEntries(threads.map(thread => [thread.id, thread.messages])));
  const [activity, setActivity] = useState<Record<string, number>>(() => Object.fromEntries(threads.map(thread => [thread.id, thread.sortOrder])));
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [recording, setRecording] = useState<{ threadId: string; seconds: number } | null>(null);
  const [voiceDraft, setVoiceDraft] = useState<{ url: string; duration: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingSeconds = useRef(0);
  const recordingTimer = useRef<number | null>(null);
  const cancelRecordingRef = useRef(false);
  const audioUrls = useRef<string[]>([]);

  const sortedThreads = useMemo(() => [...threads].sort((left, right) => (activity[right.id] || 0) - (activity[left.id] || 0)), [activity, threads]);
  const active = useMemo(() => threads.find(thread => thread.id === selectedId) || null, [selectedId, threads]);
  const activeMessages = active ? messages[active.id] || [] : [];

  useEffect(() => {
    setSelectedId(null);
    setDraft("");
    setVoiceDraft(null);
    setNotice(null);
    setMessages(Object.fromEntries(threads.map(thread => [thread.id, thread.messages])));
    setActivity(Object.fromEntries(threads.map(thread => [thread.id, thread.sortOrder])));
    setReadIds(new Set());
  }, [locale, threads]);

  useEffect(() => () => {
    cancelRecordingRef.current = true;
    mediaRecorder.current?.stop();
    mediaStream.current?.getTracks().forEach(track => track.stop());
    if (recordingTimer.current !== null) window.clearInterval(recordingTimer.current);
    audioUrls.current.forEach(url => URL.revokeObjectURL(url));
  }, []);

  function clearRecordingTimer() {
    if (recordingTimer.current !== null) window.clearInterval(recordingTimer.current);
    recordingTimer.current = null;
  }

  function releaseMicrophone() {
    clearRecordingTimer();
    mediaStream.current?.getTracks().forEach(track => track.stop());
    mediaStream.current = null;
    mediaRecorder.current = null;
  }

  function cancelRecording() {
    cancelRecordingRef.current = true;
    audioChunks.current = [];
    mediaRecorder.current?.stop();
    releaseMicrophone();
    setRecording(null);
    setVoiceDraft(null);
  }

  async function startRecording() {
    if (!selectedId || recording || voiceDraft) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNotice(t.micUnsupported);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaStream.current = stream;
      mediaRecorder.current = recorder;
      audioChunks.current = [];
      recordingSeconds.current = 0;
      cancelRecordingRef.current = false;
      recorder.ondataavailable = event => { if (event.data.size) audioChunks.current.push(event.data); };
      recorder.onstop = () => {
        const cancelled = cancelRecordingRef.current;
        const blob = new Blob(audioChunks.current, { type: recorder.mimeType || "audio/webm" });
        releaseMicrophone();
        setRecording(null);
        if (cancelled || !blob.size) return;
        const url = URL.createObjectURL(blob);
        audioUrls.current.push(url);
        setVoiceDraft({ url, duration: recordingSeconds.current });
      };
      recorder.start();
      setNotice(null);
      setRecording({ threadId: selectedId, seconds: 0 });
      recordingTimer.current = window.setInterval(() => {
        recordingSeconds.current += 1;
        setRecording(current => current ? { ...current, seconds: recordingSeconds.current } : current);
      }, 1000);
    } catch {
      releaseMicrophone();
      setRecording(null);
      setNotice(t.micDenied);
    }
  }

  function stopRecording() {
    cancelRecordingRef.current = false;
    mediaRecorder.current?.stop();
  }

  function selectThread(id: string) {
    if (recording) cancelRecording();
    setSelectedId(id);
    setReadIds(previous => new Set(previous).add(id));
    setDraft("");
    setVoiceDraft(null);
    setNotice(null);
  }

  function leaveConversation() {
    if (recording) cancelRecording();
    setSelectedId(null);
    setDraft("");
    setVoiceDraft(null);
    setNotice(null);
  }

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    const body = draft.trim();
    if (!body && !voiceDraft) return;
    const now = Date.now();
    const outgoing: DemoMessage = voiceDraft
      ? { id: `${selectedId}-${now}`, sender: "customer", kind: "audio", audioUrl: voiceDraft.url, duration: voiceDraft.duration, time: t.now }
      : { id: `${selectedId}-${now}`, sender: "customer", body, time: t.now };
    const reply: DemoMessage = { id: `${selectedId}-${now}-reply`, sender: "team", body: t.reply, time: t.now };
    setMessages(previous => ({ ...previous, [selectedId]: [...(previous[selectedId] || []), outgoing, reply] }));
    setActivity(previous => ({ ...previous, [selectedId]: now }));
    setDraft("");
    setVoiceDraft(null);
    setNotice(null);
  }

  return <section className={styles.messagesPage} aria-label={t.title}>
    <div className={styles.messageWorkspace} data-mode={active ? "conversation" : "list"}>
      <section className={styles.messageList} data-hidden={active ? "true" : "false"} aria-label={t.title}>
        <div className={styles.messageListHeading}><div><p className={styles.eyebrow}>BlueMind Web Service</p><h2>{t.title}</h2></div><Mail size={22} aria-hidden="true" /></div>
        <p className={styles.messageHint}>{t.select}</p>
        <div className={styles.threadList}>
          {sortedThreads.map(thread => {
            const latest = messages[thread.id]?.at(-1);
            const unread = thread.unread && !readIds.has(thread.id);
            return <button key={thread.id} type="button" className={styles.thread} onClick={() => selectThread(thread.id)}>
              <span className={styles.threadAvatar} aria-hidden="true">{thread.avatar}</span>
              <span className={styles.threadCopy}><span className={styles.threadTop}><strong>{thread.title}</strong>{unread && <span className={styles.unreadLabel}>{t.newLabel}</span>}</span><span className={styles.threadPreview}>{latest?.kind === "audio" ? t.voice : latest?.body || thread.preview}</span></span>
              <time>{latest?.time || thread.time}</time>
            </button>;
          })}
        </div>
      </section>
      <section className={styles.conversation} data-visible={Boolean(active)} aria-label={active?.title || t.empty}>
        {active ? <>
          <header className={styles.conversationHeader}><button type="button" className={`${styles.backToMessages} ${styles.secondary}`} onClick={leaveConversation} aria-label={t.back}><ArrowLeft size={17} aria-hidden="true" />{t.back}</button><span className={styles.conversationAvatar} aria-hidden="true">{active.avatar}</span><div><h2>{active.title}</h2><span className={styles.demoBadge}>{t.demo}</span></div></header>
          <div className={styles.conversationMessages} aria-live="polite">{activeMessages.map(message => <article key={message.id} className={styles.demoMessage} data-sender={message.sender}>{message.kind === "audio" ? <div className={styles.audioMessage}><audio controls src={message.audioUrl} aria-label={t.sentVoice} /><span>{t.voice} · {formatDuration(message.duration || 0)}</span></div> : <p>{message.body}</p>}<time><Clock3 size={13} aria-hidden="true" />{message.time}</time></article>)}</div>
          {notice && <p className={styles.messageNotice} role="alert">{notice}</p>}
          <form className={styles.demoComposer} onSubmit={send}>
            {recording && <div className={styles.recordingBar}><span className={styles.recordingDot} aria-hidden="true" /><strong>{t.recording} {formatDuration(recording.seconds)}</strong><button type="button" className={styles.voiceAction} onClick={stopRecording}><Square size={14} aria-hidden="true" />{t.stop}</button><button type="button" className={styles.voiceAction} onClick={cancelRecording}>{t.cancel}</button></div>}
            {voiceDraft && !recording && <div className={styles.voiceDraft}><audio controls src={voiceDraft.url} aria-label={t.voice} /><span>{t.voice} · {formatDuration(voiceDraft.duration)}</span><button type="submit" className={styles.voiceAction}><Send size={14} aria-hidden="true" />{t.sendVoice}</button><button type="button" className={styles.voiceAction} onClick={() => setVoiceDraft(null)}><Trash2 size={14} aria-hidden="true" />{t.deleteVoice}</button></div>}
            {!recording && !voiceDraft && <><label className={styles.srOnly} htmlFor="demo-message">{t.placeholder}</label><textarea id="demo-message" value={draft} onChange={event => setDraft(event.target.value)} placeholder={t.placeholder} rows={1} maxLength={2000} /><button type="button" className={styles.roundAction} onClick={() => void startRecording()} aria-label={t.voice} title={t.voice} disabled={!selectedId}><Mic size={18} aria-hidden="true" /></button><button className={styles.roundAction} type="submit" aria-label={t.send} title={t.send} disabled={!draft.trim()}><Send size={18} aria-hidden="true" /></button></>}
          </form>
        </> : <div className={styles.conversationEmpty}><Play size={30} strokeWidth={1.5} aria-hidden="true" /><p>{t.empty}</p></div>}
      </section>
    </div>
  </section>;
}
