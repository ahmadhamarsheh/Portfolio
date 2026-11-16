/**
 * UI strings. Every language must provide every key — the `UiDictionary`
 * type makes a missing translation a compile error, and a unit test checks
 * that no value is empty.
 */
export const languages = { en: 'English', ar: 'العربية' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';
export const langs = Object.keys(languages) as Lang[];

const en = {
  'meta.title': 'Ahmad Hamarsheh — Senior Backend Engineer',
  'meta.description':
    'Senior Backend Engineer working remotely with clients worldwide. 5+ years building payment, payout, KYC and e-commerce integration systems in Java/Spring Boot, .NET and Python/Django.',
  'meta.locale': 'en_US',

  'a11y.skip': 'Skip to content',
  'nav.label': 'Main',
  'nav.work': 'Work',
  'nav.experience': 'Experience',
  'nav.services': 'Services',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.home': 'Ahmad Hamarsheh — home',

  'lang.switch': 'عربي',
  'lang.switchLabel': 'اقرأ الموقع بالعربية',
  'theme.toLight': 'Switch to light mode',
  'theme.toDark': 'Switch to dark mode',

  'cta.hire': 'Hire me',
  'cta.work': 'View work',
  'cta.cv': 'Download CV',

  'hero.photoAlt': 'Portrait of Ahmad Hamarsheh',
  'hero.experienceAt': 'Experience at',

  'work.kicker': 'Selected work',
  'work.title': 'Case studies',
  'work.lede':
    'Real systems, described by problem, architecture and decisions. Client names and data stay confidential where an NDA applies.',
  'work.more': 'More case studies',
  'work.read': 'Read the case study',
  'work.all': 'All case studies',
  'work.next': 'Next case study',

  'cs.problem': 'The problem',
  'cs.role': 'My role',
  'cs.architecture': 'Architecture',
  'cs.decisions': 'Key decisions',
  'cs.result': 'Result',
  'cs.stack': 'Stack',
  'cs.facts': 'Project facts',
  'cs.factRole': 'Role',
  'cs.factCompany': 'Company',
  'cs.factScope': 'Scope',
  'cs.factObservability': 'Observability',
  'cs.legendScope': 'My scope',
  'cs.legendDecisions': 'Decisions, explained below',
  'cs.diagramLabel': 'Architecture diagram',
  'cs.caseStudy': 'Case study',

  'exp.kicker': 'Experience',
  'exp.title': 'Five years of growing scale and responsibility.',
  'exp.lede':
    'Started in 2021 building fintech backends for US clients and grew into leading one of those platforms — then payments and identity at telecom scale, resilient logistics microservices, and today internal engineering platforms at Apple.',
  'exp.growth': 'Growth path',
  'exp.present': 'Present',
  'exp.current': 'Current',
  'exp.now': 'Now',
  'exp.education': 'Education',
  'exp.certification': 'Certification',

  'services.kicker': 'Services',
  'services.title': 'How I can help your team',
  'services.lede':
    'For startups and businesses that need a backend done properly — scoped clearly, built with tests and handed over with documentation.',
  'services.youGet': 'What you get',
  'services.cta': 'Discuss a project',

  'about.kicker': 'About',
  'about.title': 'A remote backend engineer, working with US and European teams.',
  'about.greatAt': "What I'm great at",
  'about.languages': 'Languages',
  'skills.title': 'Skills',
  'skills.strong': 'Strong',
  'skills.working': 'Working knowledge',

  'contact.kicker': 'Contact',
  'contact.title': 'Need a backend that has to work the first time?',
  'contact.lede': 'Tell me about the role or the project. Your message goes straight to my inbox.',
  'contact.name': 'Your name',
  'contact.email': 'Email',
  'contact.company': 'Company',
  'contact.optional': 'optional',
  'contact.topic': 'What is it about?',
  'contact.topic.role': 'A full-time or contract role',
  'contact.topic.project': 'A freelance project',
  'contact.topic.other': 'Something else',
  'contact.message': 'Message',
  'contact.honeypot': 'Leave this field empty',
  'contact.send': 'Send message',
  'contact.sending': 'Sending…',
  'contact.success': 'Thank you — your message is on its way. I will get back to you by email.',
  'contact.error.generic': 'Something went wrong. Please try again, or email me directly.',
  'contact.error.rate': 'Too many messages in a short time. Please try again later.',
  'contact.error.captcha': 'Please complete the verification and try again.',
  'contact.error.fix': 'Please fix the highlighted fields.',
  'contact.direct': 'Or reach me directly',

  'val.name.required': 'Please enter your name.',
  'val.name.tooLong': 'Name is too long.',
  'val.email.invalid': 'Please enter a valid email address.',
  'val.company.tooLong': 'Company name is too long.',
  'val.topic.invalid': 'Please choose a topic.',
  'val.message.tooShort': 'Please write at least 20 characters.',
  'val.message.tooLong': 'Message is too long (max 4,000 characters).',

  'footer.rights': 'All rights reserved.',
  'footer.source': 'Source code',
  'footer.built': 'Static site built with Astro · hosted on Cloudflare',

  'notFound.title': 'Page not found',
  'notFound.text': 'The page you are looking for does not exist or has moved.',
  'notFound.home': 'Back to the home page',
} as const;

export type UiKey = keyof typeof en;
export type UiDictionary = Record<UiKey, string>;

const ar: UiDictionary = {
  'meta.title': 'أحمد حمارشة — مهندس Backend أول',
  'meta.description':
    'مهندس Backend أول يعمل عن بُعد مع عملاء حول العالم. خبرة تزيد عن 5 سنوات في بناء أنظمة الدفع وصرف الأرباح والتحقق من الهوية وتكاملات التجارة الإلكترونية باستخدام Java/Spring Boot و‎.NET‎ وPython/Django.',
  'meta.locale': 'ar_AR',

  'a11y.skip': 'انتقل إلى المحتوى',
  'nav.label': 'القائمة الرئيسية',
  'nav.work': 'الأعمال',
  'nav.experience': 'الخبرة',
  'nav.services': 'الخدمات',
  'nav.about': 'عنّي',
  'nav.contact': 'تواصل',
  'nav.menu': 'القائمة',
  'nav.home': 'أحمد حمارشة — الصفحة الرئيسية',

  'lang.switch': 'English',
  'lang.switchLabel': 'Read this site in English',
  'theme.toLight': 'التبديل إلى الوضع الفاتح',
  'theme.toDark': 'التبديل إلى الوضع الداكن',

  'cta.hire': 'وظّفني',
  'cta.work': 'شاهد أعمالي',
  'cta.cv': 'حمّل السيرة الذاتية',

  'hero.photoAlt': 'صورة أحمد حمارشة',
  'hero.experienceAt': 'خبرة في',

  'work.kicker': 'أعمال مختارة',
  'work.title': 'دراسات حالة',
  'work.lede':
    'أنظمة حقيقية، معروضة من خلال المشكلة والبنية والقرارات. أسماء العملاء وبياناتهم تبقى سرّية حيث توجد اتفاقية عدم إفصاح.',
  'work.more': 'دراسات حالة أخرى',
  'work.read': 'اقرأ دراسة الحالة',
  'work.all': 'كل دراسات الحالة',
  'work.next': 'دراسة الحالة التالية',

  'cs.problem': 'المشكلة',
  'cs.role': 'دوري',
  'cs.architecture': 'البنية المعمارية',
  'cs.decisions': 'القرارات الأساسية',
  'cs.result': 'النتيجة',
  'cs.stack': 'التقنيات',
  'cs.facts': 'معلومات المشروع',
  'cs.factRole': 'الدور',
  'cs.factCompany': 'الشركة',
  'cs.factScope': 'النطاق',
  'cs.factObservability': 'المراقبة',
  'cs.legendScope': 'نطاق عملي',
  'cs.legendDecisions': 'قرارات مشروحة بالأسفل',
  'cs.diagramLabel': 'مخطط البنية المعمارية',
  'cs.caseStudy': 'دراسة حالة',

  'exp.kicker': 'الخبرة',
  'exp.title': 'خمس سنوات من النمو في الحجم والمسؤولية.',
  'exp.lede':
    'بدأت عام 2021 ببناء أنظمة Backend مالية لعملاء أمريكيين، وتطوّرت حتى قُدت إحدى تلك المنصات — ثم المدفوعات والتحقق من الهوية على مستوى شركة اتصالات، ثم خدمات لوجستية مصغّرة مقاومة للأعطال، واليوم منصات هندسية داخلية في Apple.',
  'exp.growth': 'مسار التطور',
  'exp.present': 'حتى الآن',
  'exp.current': 'حالياً',
  'exp.now': 'الآن',
  'exp.education': 'التعليم',
  'exp.certification': 'الشهادات',

  'services.kicker': 'الخدمات',
  'services.title': 'كيف أستطيع مساعدة فريقك',
  'services.lede':
    'للشركات الناشئة والأعمال التي تحتاج Backend مبنياً بالشكل الصحيح — بنطاق واضح، ومع اختبارات، وتسليم موثّق.',
  'services.youGet': 'ما الذي تحصل عليه',
  'services.cta': 'ناقش مشروعك',

  'about.kicker': 'عنّي',
  'about.title': 'مهندس Backend يعمل عن بُعد مع فرق في الولايات المتحدة وأوروبا.',
  'about.greatAt': 'ما أتقنه',
  'about.languages': 'اللغات',
  'skills.title': 'المهارات',
  'skills.strong': 'متمكّن',
  'skills.working': 'معرفة عملية',

  'contact.kicker': 'تواصل',
  'contact.title': 'تحتاج Backend يعمل من المرة الأولى؟',
  'contact.lede': 'أخبرني عن الوظيفة أو المشروع. رسالتك تصل مباشرة إلى بريدي.',
  'contact.name': 'اسمك',
  'contact.email': 'البريد الإلكتروني',
  'contact.company': 'الشركة',
  'contact.optional': 'اختياري',
  'contact.topic': 'ما موضوع رسالتك؟',
  'contact.topic.role': 'وظيفة بدوام كامل أو بعقد',
  'contact.topic.project': 'مشروع عمل حر',
  'contact.topic.other': 'موضوع آخر',
  'contact.message': 'الرسالة',
  'contact.honeypot': 'اترك هذا الحقل فارغاً',
  'contact.send': 'أرسل الرسالة',
  'contact.sending': 'جارٍ الإرسال…',
  'contact.success': 'شكراً لك — رسالتك في الطريق. سأردّ عليك عبر البريد الإلكتروني.',
  'contact.error.generic': 'حدث خطأ ما. حاول مرة أخرى، أو راسلني مباشرة عبر البريد.',
  'contact.error.rate': 'رسائل كثيرة خلال وقت قصير. حاول مرة أخرى لاحقاً.',
  'contact.error.captcha': 'أكمل خطوة التحقق ثم حاول مرة أخرى.',
  'contact.error.fix': 'يرجى تصحيح الحقول المحدّدة.',
  'contact.direct': 'أو تواصل معي مباشرة',

  'val.name.required': 'أدخل اسمك من فضلك.',
  'val.name.tooLong': 'الاسم طويل جداً.',
  'val.email.invalid': 'أدخل بريداً إلكترونياً صحيحاً.',
  'val.company.tooLong': 'اسم الشركة طويل جداً.',
  'val.topic.invalid': 'اختر موضوع الرسالة.',
  'val.message.tooShort': 'اكتب 20 حرفاً على الأقل.',
  'val.message.tooLong': 'الرسالة طويلة جداً (الحد الأقصى 4,000 حرف).',

  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.source': 'الكود المصدري',
  'footer.built': 'موقع ثابت مبني بـ Astro · مستضاف على Cloudflare',

  'notFound.title': 'الصفحة غير موجودة',
  'notFound.text': 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
  'notFound.home': 'العودة إلى الصفحة الرئيسية',
};

export const ui: Record<Lang, UiDictionary> = { en, ar };
