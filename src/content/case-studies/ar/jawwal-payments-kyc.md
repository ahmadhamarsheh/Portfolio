---
lang: ar
key: jawwal-payments-kyc
order: 1
featured: true
kicker: اتصالات · المدفوعات والهوية
title: بوابات الدفع والتحقق من الهوية في Jawwal
summary: دفع الفواتير وشحن الرصيد والتحقق الحكومي من الهوية لأكثر من 150,000 مشترك.
facts:
  role: مهندس Backend وتكاملات
  company: Jawwal (شركة اتصالات)
  stack: [.NET Core, C#, Oracle, REST]
  observability: [Prometheus, Grafana]
  scope: [المدفوعات, KYC, التسوية]
problem: احتاج المشتركون إلى دفع الفواتير وشحن الرصيد عبر بوابات دفع محلية، وكان لا بدّ من التحقق من هوية المشتركين الجدد لحظياً مقابل سجلات وزارة الداخلية (KYC) أثناء التسجيل.
myRole: دمجت بوابتي الدفع eSadad وReflect والتحقق من الهوية لدى وزارة الداخلية في خدمات ‎.NET Core‎ على Oracle، وحافظت على استقرار الخدمات المحيطة في بيئة الإنتاج.
diagram:
  width: 1000
  height: 360
  description: يدفع المشتركون الفواتير ويشحنون الرصيد عبر خدمات الـ Backend التي تتصل ببوابتي eSadad وReflect. تُخزَّن كل عملية في Oracle مع حالتها، وهذه الحالة تغذّي التسوية. كما تتصل خدمات الـ Backend بخدمة التحقق من الهوية لدى وزارة الداخلية أثناء التسجيل.
  nodes:
    - { id: subscribers, x: 40, y: 40, label: المشتركون, sub: الفواتير وشحن الرصيد }
    - { id: backend, x: 380, y: 40, label: Backend services, sub: .NET Core · REST, highlight: true }
    - { id: gateways, x: 720, y: 40, label: بوابات الدفع, sub: eSadad · Reflect }
    - { id: recon, x: 40, y: 232, label: التسوية, sub: تتبّع الحالة }
    - { id: oracle, x: 380, y: 232, label: Oracle DB, sub: العمليات }
    - { id: kyc, x: 720, y: 232, label: التحقق من الهوية (KYC), sub: وزارة الداخلية }
  edges:
    - { from: subscribers, to: backend, points: [[280, 84], [379, 84]] }
    - { from: backend, to: gateways, points: [[620, 84], [719, 84]], label: الدفع, labelAt: [670, 70] }
    - { from: backend, to: oracle, points: [[460, 128], [460, 231]] }
    - { from: oracle, to: recon, points: [[380, 276], [281, 276]] }
    - { from: backend, to: kyc, points: [[540, 128], [540, 180], [840, 180], [840, 231]], label: تحقق من الهوية, labelAt: [690, 166] }
  markers:
    - { n: 1, x: 330, y: 248 }
    - { n: 2, x: 616, y: 232 }
    - { n: 3, x: 616, y: 40 }
    - { n: 4, x: 864, y: 206 }
decisions:
  - title: لا تُفشِل عملية دفع دون تأكّد.
    text: عند انتهاء مهلة البوابة أُبقي العملية معلّقة في Oracle حتى يؤكد فحص الحالة أو ردّ البوابة النتيجة النهائية، ثم تُغلق التسوية الحلقة.
    marker: 1
  - title: التحسين انطلاقاً من خطة التنفيذ.
    text: حسّنت الإجراءات المخزّنة وطرق العرض على المسارات الأكثر استخداماً انطلاقاً من خطط تنفيذها، لا بالتخمين.
    marker: 2
  - title: مرجع واحد لكل عملية دفع.
    text: تحمل كل عملية دفع مرجعاً فريداً، فلا يمكن لإعادة المحاولة أو لردّ مكرر أن يخصم من المشترك مرتين.
    marker: 3
  - title: تحقّق لحظي من الهوية.
    text: يُستدعى فحص KYC لدى وزارة الداخلية مباشرة أثناء تسجيل المشترك وتفعيله، لا في دفعة لاحقة.
    marker: 4
  - title: اكتشف المشكلة قبل أن يلاحظها المشترك.
    text: راقبت بيئة الإنتاج عبر لوحات Prometheus وGrafana للخدمات وقواعد البيانات.
results:
  - { value: "+150,000", label: مشترك يتم خدمتهم }
  - { value: "أسرع بـ ~10%", label: في الاستجابة على مسارات SQL المحسّنة }
  - { value: الآلاف, label: من عمليات الدفع يومياً }
---
