import type { Locale } from "../../components/localization-provider";
import type { AiErrorCode } from "../lib/ai/contract";

export type ChatCopy = {
  newChat: string;
  conversations: string;
  saveChat: string;
  chatSidebar: string;
  expandSidebar: string;
  collapseSidebar: string;
  openSidebar: string;
  closeSidebar: string;
  close: string;
  discardMessage: string;
  heading: string;
  prompt: string;
  suggestions: string[];
  message: string;
  conversation: string;
  yourMessage: string;
  aiResponse: string;
  retry: string;
  addAttachment: string;
  selectedAttachments: string;
  messageAttachments: string;
  addImage: string;
  addFile: string;
  takePhoto: string;
  attachmentInfo: string;
  placeholder: string;
  sendMessage: string;
  stopResponse: string;
  preparing: string;
  cancel: string;
  availableStatus: string;
  unavailableStatus: string;
  responseActions: string;
  like: string;
  dislike: string;
  copy: string;
  copied: string;
  share: string;
  regenerate: string;
  wait: string;
  showInstantly: string;
  messageCard: string;
  messageCardActions: string;
  editMessage: string;
  copyMessage: string;
  shareMessage: string;
  edit: string;
  closeImage: string;
  zoomOut: string;
  zoomIn: string;
  resetZoom: string;
  errors: Record<AiErrorCode, string>;
  attachmentLimit: string;
  attachmentSessionLimit: string;
  attachmentReadError: string;
};

const en: ChatCopy = {
  newChat: "New chat", conversations: "Conversations", saveChat: "Sign in to save this chat",
  chatSidebar: "Chat sidebar", expandSidebar: "Expand sidebar", collapseSidebar: "Collapse sidebar",
  openSidebar: "Open sidebar", closeSidebar: "Close sidebar", close: "Close",
  discardMessage: "Discard your unsent message and return to the homepage?",
  heading: "What can I help you create?", prompt: "Ask BlueMind anything...",
  suggestions: ["Create a website", "Design a page", "Improve my website", "Business ideas", "Help me get started", "Explore our services"],
  message: "Message", conversation: "Conversation", yourMessage: "Your message", aiResponse: "BlueMind AI response", retry: "Retry",
  addAttachment: "Add attachment", selectedAttachments: "Selected attachments", messageAttachments: "Message attachments",
  addImage: "Add image", addFile: "Add file", takePhoto: "Take a photo",
  attachmentInfo: "Up to 4 files, 2 MB each; 2.5 MB per chat. Files stay in this browser session and are sent privately to OpenAI for analysis.",
  placeholder: "Ask BlueMind anything...", sendMessage: "Send message", stopResponse: "Stop response",
  preparing: "Preparing attachments", cancel: "Cancel",
  availableStatus: "Messages are sent to OpenAI. Avoid sharing sensitive information.",
  unavailableStatus: "AI responses are not connected", responseActions: "Response actions", like: "Like response", dislike: "Dislike response",
  copy: "Copy", copied: "Copied!", share: "Share", regenerate: "Regenerate", wait: "Wait for the current response",
  showInstantly: "Show instantly", messageCard: "Message", messageCardActions: "Message card actions", editMessage: "Edit message",
  copyMessage: "Copy message", shareMessage: "Share message", edit: "Edit", closeImage: "Close image", zoomOut: "Zoom out", zoomIn: "Zoom in", resetZoom: "Reset zoom",
  errors: {
    unavailable: "BlueMind AI is temporarily unavailable. Please try again later.", invalid: "Please shorten your message and try again.",
    rate: "Too many requests. Please wait a minute before trying again.", timeout: "The response took too long. Please try again.",
    failed: "We could not complete the response. Please try again.", stopped: "The response was stopped before it finished.",
    attachment_invalid: "This file could not be processed. Use a valid JPEG, PNG, WebP, PDF, DOCX, UTF-8 TXT or XLSX file without encryption or active content.",
    attachment_limit: "This document exceeds analysis limits. Use up to 10 PDF pages, 40,000 text characters, or 2,000 spreadsheet cells (500 rows per sheet). No content was silently omitted.",
    attachment_session: "Your upload session expired. Please try again.", attachment_context: "This chat is too long to include all its attachments. Start a new chat and attach the relevant files again.",
    demo_limit: "You have used the two preview messages. Continue in BlueMind AI to keep working on your idea.",
  },
  attachmentLimit: "Use up to 4 attachments and 2.5 MB total per conversation (2 MB per file). Start a new chat for more files.",
  attachmentSessionLimit: "This temporary session has reached its attachment memory limit. Refresh to clear it before adding more files.",
  attachmentReadError: "Unable to prepare attachments.",
};

const sv: ChatCopy = {
  ...en,
  newChat: "Ny chatt", conversations: "Konversationer", saveChat: "Logga in för att spara chatten",
  chatSidebar: "Chattmeny", expandSidebar: "Visa sidofält", collapseSidebar: "Dölj sidofält", openSidebar: "Öppna sidofält", closeSidebar: "Stäng sidofält", close: "Stäng",
  discardMessage: "Vill du ta bort det oskickade meddelandet och gå tillbaka till startsidan?",
  heading: "Vad kan jag hjälpa dig att skapa?", prompt: "Fråga BlueMind vad som helst...",
  suggestions: ["Skapa en webbplats", "Designa en sida", "Förbättra min webbplats", "Affärsidéer", "Hjälp mig att komma igång", "Utforska våra tjänster"],
  message: "Meddelande", conversation: "Konversation", yourMessage: "Ditt meddelande", aiResponse: "BlueMind AI-svar", retry: "Försök igen",
  addAttachment: "Lägg till bilaga", selectedAttachments: "Valda bilagor", messageAttachments: "Meddelandebilagor", addImage: "Lägg till bild", addFile: "Lägg till fil", takePhoto: "Ta ett foto",
  attachmentInfo: "Upp till 4 filer, 2 MB per fil och 2,5 MB per chatt. Filerna stannar i den här webbläsarsessionen och skickas privat till OpenAI för analys.", placeholder: "Fråga BlueMind vad som helst...", sendMessage: "Skicka meddelande", stopResponse: "Stoppa svaret",
  preparing: "Förbereder bilagor", cancel: "Avbryt", availableStatus: "Meddelanden skickas till OpenAI. Undvik att dela känslig information.", unavailableStatus: "AI-svar är inte anslutna", responseActions: "Svarsåtgärder", like: "Gilla svaret", dislike: "Ogilla svaret", copy: "Kopiera", copied: "Kopierat!", share: "Dela", regenerate: "Skapa om", wait: "Vänta på det aktuella svaret", showInstantly: "Visa direkt", messageCard: "Meddelande", messageCardActions: "Åtgärder för meddelandekort", editMessage: "Redigera meddelande", copyMessage: "Kopiera meddelande", shareMessage: "Dela meddelande", edit: "Redigera", closeImage: "Stäng bild", zoomOut: "Zooma ut", zoomIn: "Zooma in", resetZoom: "Återställ zoom",
  errors: { ...en.errors, unavailable: "BlueMind AI är tillfälligt otillgänglig. Försök igen senare.", invalid: "Korta meddelandet och försök igen.", rate: "För många förfrågningar. Vänta en minut och försök igen.", timeout: "Svaret tog för lång tid. Försök igen.", failed: "Svaret kunde inte slutföras. Försök igen.", stopped: "Svaret stoppades innan det blev klart.", attachment_session: "Din uppladdningssession har gått ut. Försök igen.", attachment_context: "Chatten är för lång för att ta med alla bilagor. Starta en ny chatt och lägg till de relevanta filerna igen." },
  attachmentLimit: "Använd högst 4 bilagor och 2,5 MB totalt per konversation (2 MB per fil). Starta en ny chatt för fler filer.",
  attachmentSessionLimit: "Den tillfälliga sessionen har nått sin gräns för bilagor. Uppdatera sidan för att rensa den innan du lägger till fler filer.",
  attachmentReadError: "Bilagorna kunde inte förberedas.",
};

const ar: ChatCopy = {
  ...en,
  newChat: "محادثة جديدة", conversations: "المحادثات", saveChat: "سجّل الدخول لحفظ هذه المحادثة",
  chatSidebar: "قائمة المحادثة", expandSidebar: "فتح الشريط الجانبي", collapseSidebar: "طيّ الشريط الجانبي", openSidebar: "فتح الشريط الجانبي", closeSidebar: "إغلاق الشريط الجانبي", close: "إغلاق",
  discardMessage: "هل تريد تجاهل رسالتك غير المرسلة والعودة إلى الصفحة الرئيسية؟",
  heading: "ماذا يمكنني أن أساعدك على إنشائه؟", prompt: "اسأل BlueMind عن أي شيء...",
  suggestions: ["أنشئ موقعًا", "صمّم صفحة", "حسّن موقعي", "أفكار لمشروع", "ساعدني على البدء", "استكشف خدماتنا"],
  message: "رسالة", conversation: "محادثة", yourMessage: "رسالتك", aiResponse: "رد BlueMind AI", retry: "إعادة المحاولة",
  addAttachment: "إضافة مرفق", selectedAttachments: "المرفقات المحددة", messageAttachments: "مرفقات الرسالة", addImage: "إضافة صورة", addFile: "إضافة ملف", takePhoto: "التقاط صورة",
  attachmentInfo: "يمكنك إضافة 4 ملفات كحد أقصى، بحجم 2 ميغابايت للملف و2.5 ميغابايت للمحادثة. تبقى الملفات في جلسة المتصفح وتُرسل بشكل خاص إلى OpenAI للتحليل.", placeholder: "اسأل BlueMind عن أي شيء...", sendMessage: "إرسال الرسالة", stopResponse: "إيقاف الرد",
  preparing: "جارٍ تجهيز المرفقات", cancel: "إلغاء", availableStatus: "تُرسل الرسائل إلى OpenAI. تجنّب مشاركة المعلومات الحساسة.", unavailableStatus: "ردود الذكاء الاصطناعي غير متصلة", responseActions: "إجراءات الرد", like: "أعجبني الرد", dislike: "لم يعجبني الرد", copy: "نسخ", copied: "تم النسخ!", share: "مشاركة", regenerate: "إنشاء رد جديد", wait: "انتظر حتى يكتمل الرد الحالي", showInstantly: "إظهار الرد فورًا", messageCard: "رسالة", messageCardActions: "إجراءات بطاقة الرسالة", editMessage: "تعديل الرسالة", copyMessage: "نسخ الرسالة", shareMessage: "مشاركة الرسالة", edit: "تعديل", closeImage: "إغلاق الصورة", zoomOut: "تصغير", zoomIn: "تكبير", resetZoom: "إعادة ضبط التكبير",
  errors: { ...en.errors, unavailable: "BlueMind AI غير متاح مؤقتًا. حاول مرة أخرى لاحقًا.", invalid: "اختصر رسالتك وحاول مرة أخرى.", rate: "عدد الطلبات كبير. انتظر دقيقة ثم حاول مرة أخرى.", timeout: "استغرق الرد وقتًا طويلًا. حاول مرة أخرى.", failed: "تعذر إكمال الرد. حاول مرة أخرى.", stopped: "توقف الرد قبل اكتماله.", attachment_session: "انتهت جلسة رفع الملفات. حاول مرة أخرى.", attachment_context: "المحادثة طويلة جدًا لإضافة كل مرفقاتها. ابدأ محادثة جديدة وأرفق الملفات المهمة مرة أخرى." },
  attachmentLimit: "استخدم 4 مرفقات كحد أقصى و2.5 ميغابايت للمحادثة (2 ميغابايت للملف). ابدأ محادثة جديدة لإضافة ملفات أخرى.",
  attachmentSessionLimit: "وصلت الجلسة المؤقتة إلى حد المرفقات. حدّث الصفحة لمسحها قبل إضافة ملفات أخرى.",
  attachmentReadError: "تعذر تجهيز المرفقات.",
};

export const chatCopy: Record<Locale, ChatCopy> = { en, sv, ar };

export function attachmentErrorMessage(value: unknown, locale: Locale) {
  const message = value instanceof Error ? value.message : "Unable to prepare attachments.";
  if (locale === "en") return message;
  const translations: Record<string, Record<Exclude<Locale, "en">, string>> = {
    "Choose JPEG, PNG, WebP, PDF, DOCX, TXT or XLSX files.": { sv: "Välj JPEG-, PNG-, WebP-, PDF-, DOCX-, TXT- eller XLSX-filer.", ar: "اختر ملفات JPEG أو PNG أو WebP أو PDF أو DOCX أو TXT أو XLSX." },
    "Each file must be nonempty and no larger than 2 MB.": { sv: "Varje fil måste innehålla data och vara högst 2 MB.", ar: "يجب ألا يكون الملف فارغًا وألا يتجاوز حجمه 2 ميغابايت." },
    "Please shorten or rename this file before attaching it.": { sv: "Korta filnamnet eller byt namn på filen innan du bifogar den.", ar: "اختصر اسم الملف أو غيّر اسمه قبل إرفاقه." },
    "Unable to read this file. Please select it again.": { sv: "Filen kunde inte läsas. Välj den igen.", ar: "تعذر قراءة الملف. اختره مرة أخرى." },
    "File preparation cancelled.": { sv: "Filförberedelsen avbröts.", ar: "تم إلغاء تجهيز الملف." },
    "This image cannot be opened. Choose JPEG, PNG or WebP.": { sv: "Bilden kan inte öppnas. Välj JPEG, PNG eller WebP.", ar: "لا يمكن فتح هذه الصورة. اختر JPEG أو PNG أو WebP." },
    "Please resize this image to 16 megapixels or less.": { sv: "Ändra storlek på bilden till högst 16 megapixlar.", ar: "غيّر حجم الصورة لتصبح 16 ميغابكسل أو أقل." },
  };
  return translations[message]?.[locale] ?? chatCopy[locale].attachmentReadError;
}
