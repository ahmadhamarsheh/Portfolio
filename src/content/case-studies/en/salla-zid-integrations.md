---
lang: en
key: salla-zid-integrations
order: 3
kicker: Logistics · E-commerce integrations
title: Resilient Salla & Zid integrations at Logestechs
summary: Store orders flowing into shipment tracking and inventory — even when a third-party API is slow or down.
facts:
  role: Backend Engineer
  company: Logestechs — logistics software
  stack: [Java, Spring Boot, Spring Data JPA, MySQL, RabbitMQ, Redis, Resilience4j]
  scope: [Integrations, Resilience, Performance]
problem: Merchants on Salla and Zid needed their orders to flow into the logistics platform for shipment tracking and inventory. Third-party APIs can be slow or briefly unavailable, and the integration had to keep working through that.
myRole: I built the Spring Boot integration with Salla and Zid and the event-driven messaging around it, and tuned the high-traffic endpoints of the shipment and inventory services.
diagram:
  width: 1000
  height: 360
  description: Salla and Zid stores send webhooks to the integration service, which also calls their APIs. The integration service passes orders to the shipment and inventory services, which use MySQL and a Redis cache. When a sync fails, it is queued in RabbitMQ and retried later.
  nodes:
    - { id: stores, x: 40, y: 40, label: Salla · Zid, sub: stores · webhooks · APIs }
    - { id: integration, x: 380, y: 40, label: Integration service, sub: Spring Boot · Resilience4j, highlight: true }
    - { id: shipments, x: 720, y: 40, label: Shipment & inventory, sub: Spring Boot services, highlight: true }
    - { id: rabbit, x: 380, y: 232, label: RabbitMQ, sub: events · retry queue }
    - { id: db, x: 720, y: 232, label: MySQL + Redis, sub: tuned queries · cache }
  edges:
    - { from: stores, to: integration, points: [[280, 69], [379, 69]], label: webhooks, labelAt: [330, 57] }
    - { from: integration, to: stores, points: [[380, 99], [281, 99]], label: API calls, labelAt: [330, 121] }
    - { from: integration, to: shipments, points: [[620, 84], [719, 84]], label: orders, labelAt: [670, 72] }
    - { from: integration, to: rabbit, points: [[460, 128], [460, 231]], label: failed syncs, labelAt: [448, 184], labelAnchor: end }
    - { from: rabbit, to: integration, points: [[540, 232], [540, 129]], label: retry later, labelAt: [552, 184], labelAnchor: start }
    - { from: shipments, to: db, points: [[840, 128], [840, 231]] }
  markers:
    - { n: 1, x: 616, y: 40 }
    - { n: 2, x: 616, y: 232 }
    - { n: 3, x: 670, y: 108 }
    - { n: 4, x: 956, y: 232 }
decisions:
  - title: Fail fast, recover gracefully.
    text: Every Salla and Zid call is wrapped in Resilience4j retries, a circuit breaker and a fallback, so a slow store API can't drag the platform down with it.
    marker: 1
  - title: Failed syncs aren't dropped.
    text: When a store API is down, the sync is queued in RabbitMQ and retried later instead of being lost.
    marker: 2
  - title: Event-driven between services.
    text: RabbitMQ messaging keeps the integration decoupled from the shipment and inventory services.
    marker: 3
  - title: Measure, then tune.
    text: SQL tuning, indexing and Redis caching on more than 10 high-traffic endpoints.
    marker: 4
results:
  - { value: "~15%", label: lower API p95 latency }
  - { value: "~20%", label: lower database load }
  - { value: "10+", label: high-traffic endpoints tuned }
---
