---
lang: en
key: jawwal-payments-kyc
order: 1
featured: true
kicker: Telecom · Payments & identity
title: Payment gateways & KYC at Jawwal
summary: Bills, top-ups and government identity checks for 150,000+ subscribers.
facts:
  role: Backend & Integration Engineer
  company: Jawwal — telecom operator
  stack: [.NET Core, C#, Oracle, REST]
  observability: [Prometheus, Grafana]
  scope: [Payments, KYC, Reconciliation]
problem: Subscribers needed to pay bills and top up through local payment gateways, and new subscribers had to be verified in real time against Ministry of Interior records (KYC) during onboarding.
myRole: I integrated the eSadad and Reflect payment gateways and Ministry of Interior identity verification into .NET Core services on Oracle, and kept the surrounding services healthy in production.
diagram:
  width: 1000
  height: 360
  description: Subscribers pay bills and top-ups through the backend services, which call the eSadad and Reflect payment gateways. Each transaction is stored in Oracle with its status, which feeds reconciliation. The backend also calls the Ministry of Interior identity (KYC) service during onboarding.
  nodes:
    - { id: subscribers, x: 40, y: 40, label: Subscribers, sub: bills & top-ups }
    - { id: backend, x: 380, y: 40, label: Backend services, sub: .NET Core · REST, highlight: true }
    - { id: gateways, x: 720, y: 40, label: Payment gateways, sub: eSadad · Reflect }
    - { id: recon, x: 40, y: 232, label: Reconciliation, sub: status tracking }
    - { id: oracle, x: 380, y: 232, label: Oracle DB, sub: transactions }
    - { id: kyc, x: 720, y: 232, label: Identity (KYC), sub: Ministry of Interior }
  edges:
    - { from: subscribers, to: backend, points: [[280, 84], [379, 84]] }
    - { from: backend, to: gateways, points: [[620, 84], [719, 84]], label: payments, labelAt: [670, 70] }
    - { from: backend, to: oracle, points: [[460, 128], [460, 231]] }
    - { from: oracle, to: recon, points: [[380, 276], [281, 276]] }
    - { from: backend, to: kyc, points: [[540, 128], [540, 180], [840, 180], [840, 231]], label: identity check, labelAt: [690, 166] }
  markers:
    - { n: 1, x: 330, y: 248 }
    - { n: 2, x: 616, y: 232 }
    - { n: 3, x: 616, y: 40 }
    - { n: 4, x: 864, y: 206 }
decisions:
  - title: Never fail a payment blindly.
    text: On a gateway timeout the transaction stays pending in Oracle until a status check or the gateway's callback confirms the final result — then reconciliation closes the loop.
    marker: 1
  - title: Tune from the execution plan.
    text: Stored procedures and views on the hot paths were optimised from their execution plans, not by guesswork.
    marker: 2
  - title: One reference per payment.
    text: Every payment carries a unique transaction reference, so a retry or a duplicate callback can never charge a subscriber twice.
    marker: 3
  - title: Verify identity in real time.
    text: The Ministry of Interior KYC check is called live during subscriber onboarding and activation, not in a later batch.
    marker: 4
  - title: See problems before subscribers do.
    text: Production monitored with Prometheus and Grafana dashboards across services and databases.
results:
  - { value: "150,000+", label: subscribers served }
  - { value: "~10% faster", label: responses on tuned SQL paths }
  - { value: Thousands, label: of payment transactions handled every day }
---
