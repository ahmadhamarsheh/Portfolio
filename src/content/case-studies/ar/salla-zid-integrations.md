---
lang: ar
key: salla-zid-integrations
order: 3
kicker: لوجستيات · تكاملات التجارة الإلكترونية
title: تكاملات Salla وZid مقاومة للأعطال في Logestechs
summary: طلبات المتاجر تصل إلى تتبّع الشحنات والمخزون — حتى عندما تكون واجهة الطرف الخارجي بطيئة أو متوقفة.
facts:
  role: مهندس Backend
  company: Logestechs — برمجيات لوجستية
  stack: [Java, Spring Boot, Spring Data JPA, MySQL, RabbitMQ, Redis, Resilience4j]
  scope: [التكاملات, المرونة, الأداء]
problem: احتاج التجّار على Salla وZid إلى وصول طلباتهم إلى المنصة اللوجستية لتتبّع الشحنات وإدارة المخزون. واجهات الأطراف الخارجية قد تكون بطيئة أو متوقفة لفترات قصيرة، وكان على التكامل أن يستمر بالعمل رغم ذلك.
myRole: بنيت تكامل Spring Boot مع Salla وZid والمراسلة القائمة على الأحداث من حوله، وحسّنت نقاط النهاية الأكثر ضغطاً في خدمات الشحن والمخزون.
diagram:
  width: 1000
  height: 360
  description: ترسل متاجر Salla وZid إشعارات Webhook إلى خدمة التكامل، التي تستدعي واجهاتها أيضاً. تمرّر خدمة التكامل الطلبات إلى خدمات الشحن والمخزون التي تستخدم MySQL وذاكرة Redis المؤقتة. عند فشل المزامنة توضع في طابور RabbitMQ وتُعاد محاولتها لاحقاً.
  nodes:
    - { id: stores, x: 40, y: 40, label: Salla · Zid, sub: المتاجر · Webhooks · APIs }
    - { id: integration, x: 380, y: 40, label: Integration service, sub: Spring Boot · Resilience4j, highlight: true }
    - { id: shipments, x: 720, y: 40, label: الشحن والمخزون, sub: خدمات Spring Boot, highlight: true }
    - { id: rabbit, x: 380, y: 232, label: RabbitMQ, sub: أحداث · طابور إعادة المحاولة }
    - { id: db, x: 720, y: 232, label: MySQL + Redis, sub: استعلامات محسّنة · Cache }
  edges:
    - { from: stores, to: integration, points: [[280, 69], [379, 69]], label: webhooks, labelAt: [330, 57] }
    - { from: integration, to: stores, points: [[380, 99], [281, 99]], label: API calls, labelAt: [330, 121] }
    - { from: integration, to: shipments, points: [[620, 84], [719, 84]], label: الطلبات, labelAt: [670, 72] }
    - { from: integration, to: rabbit, points: [[460, 128], [460, 231]], label: مزامنة فاشلة, labelAt: [448, 184], labelAnchor: end }
    - { from: rabbit, to: integration, points: [[540, 232], [540, 129]], label: إعادة لاحقاً, labelAt: [552, 184], labelAnchor: start }
    - { from: shipments, to: db, points: [[840, 128], [840, 231]] }
  markers:
    - { n: 1, x: 616, y: 40 }
    - { n: 2, x: 616, y: 232 }
    - { n: 3, x: 670, y: 108 }
    - { n: 4, x: 956, y: 232 }
decisions:
  - title: افشل بسرعة، وتعافَ بهدوء.
    text: كل استدعاء لـ Salla وZid محاط بإعادة المحاولة وقاطع الدارة والبديل عبر Resilience4j، فلا تستطيع واجهة متجر بطيئة أن تُبطئ المنصة كلها.
    marker: 1
  - title: المزامنة الفاشلة لا تضيع.
    text: عندما تتوقف واجهة المتجر، توضع المزامنة في طابور RabbitMQ وتُعاد محاولتها لاحقاً بدل أن تضيع.
    marker: 2
  - title: الخدمات تتواصل عبر الأحداث.
    text: المراسلة عبر RabbitMQ تفصل التكامل عن خدمات الشحن والمخزون.
    marker: 3
  - title: قِس أولاً، ثم حسّن.
    text: تحسين SQL والفهارس والتخزين المؤقت بـ Redis على أكثر من 10 نقاط نهاية عالية الضغط.
    marker: 4
results:
  - { value: "~15%", label: انخفاض في زمن استجابة الـ API (p95) }
  - { value: "~20%", label: انخفاض في الحمل على قاعدة البيانات }
  - { value: "+10", label: نقاط نهاية عالية الضغط تم تحسينها }
---
