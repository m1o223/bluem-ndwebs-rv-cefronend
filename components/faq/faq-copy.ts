import type { Locale } from "../localization-provider";

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqCopy = {
  title: string;
  viewAll: string;
  items: FaqItem[];
};

export const faqCopy: Record<Locale, FaqCopy> = {
  en: {
    title: "Frequently Asked Questions",
    viewAll: "View all FAQs",
    items: [
      { question: "Who are we?", answer: "We are BlueMind, a company specializing in artificial intelligence and software development. We launched BlueMind Web Service to design and develop websites around each client's idea and project needs." },
      { question: "How much does it cost to design a website?", answer: "Starting prices are 5,000 SEK for a 3-page website, 9,000 SEK for a website of up to 6 pages, and 15,000 SEK for a project of up to 10 pages, such as an online store. The final price depends on your project's details." },
      { question: "What is included in the price?", answer: "The price includes your complete website, designed to work on desktop and laptop computers, tablets, and mobile phones. Compatibility across all three screen sizes is included at no extra cost." },
      { question: "How long does it take to prepare my website?", answer: "We usually prepare your website within 3 to 5 days, depending on its size and the features you need." },
      { question: "What makes BlueMind Web Service different?", answer: "We design every website around your project idea, combining custom design, fast delivery, and suitable pricing." },
      { question: "What payment methods are available?", answer: "You will see the payment methods available for your project when you confirm your order and before payment." },
      { question: "When do I pay for the website?", answer: "You choose the design and content with BlueMind AI. After you confirm your order, you pay and the request is sent to our team. When the first design is ready, we contact you so you can review it and share your feedback." },
      { question: "Why do I need to sign in?", answer: "With an account, you can follow your project step by step, contact us directly, and receive updates until your website is ready. You can browse the website and view our services without an account." },
      { question: "What happens if I do not like the first design?", answer: "We listen to your feedback and adjust the details that do not fit. If the overall design direction does not suit your idea, we create a new design based on your feedback." },
      { question: "What happens after I receive my website?", answer: "You receive the website with all project files. If you would like us to continue looking after it, you can subscribe to BlueMind Care for updates, security checks, and changes, depending on the plan." },
      { question: "How can I contact you?", answer: "You can contact our team through the chat after signing in. You can also message us from the Contact Us page, or use the email address and phone number listed there." },
    ],
  },
  ar: {
    title: "الأسئلة الشائعة",
    viewAll: "اقرأ المزيد من الأسئلة",
    items: [
      { question: "مين نحنا؟", answer: "نحنا BlueMind، شركة متخصّصة بالذكاء الاصطناعي والبرمجة. أطلقنا BlueMind Web Service لتصميم وتطوير المواقع حسب فكرة كل عميل واحتياجات مشروعه." },
      { question: "قديش بيكلّف تصميم موقع؟", answer: "الأسعار المبدئية هي 5,000 كرون لموقع من 3 صفحات، 9,000 كرون لموقع حتى 6 صفحات، و15,000 كرون لمشروع حتى 10 صفحات، مثل متجر إلكتروني. السعر النهائي بيعتمد على تفاصيل مشروعك." },
      { question: "شو بيشمل السعر؟", answer: "السعر بيشمل موقعك كامل بتصميم مناسب للكمبيوتر واللابتوب، والآيباد، والجوال. التوافق مع الأحجام الثلاثة مشمول بدون تكلفة إضافية." },
      { question: "قديش بياخد تجهيز موقعي؟", answer: "عادةً منجهّز موقعك خلال 3 إلى 5 أيام، حسب حجمه والميزات المطلوبة." },
      { question: "شو بيميز BlueMind Web Service؟", answer: "منصمّم كل موقع حسب فكرة مشروعك، ومنجمع بين التصميم المخصّص وسرعة التنفيذ والأسعار المناسبة." },
      { question: "شو طرق الدفع المتاحة؟", answer: "بتشوف طرق الدفع المتاحة لمشروعك عند تأكيد الطلب وقبل الدفع." },
      { question: "إمتى بدفع تكلفة الموقع؟", answer: "بتختار التصميم والنص مع BlueMind AI، وبعد ما تأكّد طلبك بتدفع وبيوصل الطلب لفريقنا. لما يجهز التصميم الأول، منتواصل معك حتى تشوفه وتعطينا رأيك." },
      { question: "ليش بدي سجّل دخول؟", answer: "بحسابك فيك تتابع مشروعك مرحلة بمرحلة، تتواصل معنا مباشرة، وتستلم تحديثات لحد ما يجهز موقعك. وفيك تتصفّح الموقع وتشوف الخدمات بدون حساب." },
      { question: "شو بيصير إذا ما عجبني التصميم الأول؟", answer: "منسمع ملاحظاتك ومنعدّل التفاصيل اللي ما ناسبتك. وإذا اتجاه التصميم كله ما ناسب فكرتك، منعمل تصميم جديد بناءً على ملاحظاتك." },
      { question: "شو بيصير بعد ما أستلم موقعي؟", answer: "بتستلم الموقع مع كل ملفات الشغل. وإذا بدك نضل نتابعه معك، فيك تشترك بـ BlueMind Care للتحديثات وفحوصات الأمان والتعديلات، حسب الباقة." },
      { question: "كيف فيني أتواصل معكم؟", answer: "فيك تحكي مع فريقنا من الشات بعد تسجيل الدخول. وفيك كمان تراسلنا من صفحة Contact Us، أو تستخدم الإيميل ورقم التلفون الموجودين فيها." },
    ],
  },
  sv: {
    title: "Vanliga frågor",
    viewAll: "Visa alla vanliga frågor",
    items: [
      { question: "Vilka är vi?", answer: "Vi är BlueMind, ett företag som specialiserar sig på artificiell intelligens och mjukvaruutveckling. Vi lanserade BlueMind Web Service för att designa och utveckla webbplatser utifrån varje kunds idé och projektets behov." },
      { question: "Vad kostar det att designa en webbplats?", answer: "Startpriserna är 5 000 SEK för en webbplats med 3 sidor, 9 000 SEK för en webbplats med upp till 6 sidor och 15 000 SEK för ett projekt med upp till 10 sidor, till exempel en webbutik. Slutpriset beror på projektets detaljer." },
      { question: "Vad ingår i priset?", answer: "Priset inkluderar en komplett webbplats som är utformad för dator, laptop, surfplatta och mobil. Kompatibilitet med alla tre skärmstorlekar ingår utan extra kostnad." },
      { question: "Hur lång tid tar det att färdigställa min webbplats?", answer: "Vi färdigställer vanligtvis din webbplats inom 3 till 5 dagar, beroende på storlek och vilka funktioner du behöver." },
      { question: "Vad skiljer BlueMind Web Service från andra?", answer: "Vi designar varje webbplats utifrån din projektidé och kombinerar skräddarsydd design, snabb leverans och rimliga priser." },
      { question: "Vilka betalningsmetoder finns?", answer: "Du ser vilka betalningsmetoder som är tillgängliga för ditt projekt när du bekräftar din beställning och innan betalningen." },
      { question: "När betalar jag för webbplatsen?", answer: "Du väljer design och innehåll med BlueMind AI. När du har bekräftat din beställning betalar du och förfrågan skickas till vårt team. När den första designen är klar kontaktar vi dig så att du kan granska den och lämna feedback." },
      { question: "Varför behöver jag logga in?", answer: "Med ett konto kan du följa projektet steg för steg, kontakta oss direkt och få uppdateringar tills webbplatsen är klar. Du kan bläddra på webbplatsen och se våra tjänster utan konto." },
      { question: "Vad händer om jag inte gillar den första designen?", answer: "Vi lyssnar på din feedback och justerar detaljer som inte passar. Om den övergripande designriktningen inte passar din idé skapar vi en ny design utifrån dina synpunkter." },
      { question: "Vad händer efter att jag har fått min webbplats?", answer: "Du får webbplatsen med alla projektfiler. Om du vill att vi fortsätter att ta hand om den kan du prenumerera på BlueMind Care för uppdateringar, säkerhetskontroller och ändringar, beroende på plan." },
      { question: "Hur kan jag kontakta er?", answer: "Du kan kontakta vårt team via chatten efter att du har loggat in. Du kan också skriva till oss från sidan Contact Us eller använda e-postadressen och telefonnumret som finns där." },
    ],
  },
};
