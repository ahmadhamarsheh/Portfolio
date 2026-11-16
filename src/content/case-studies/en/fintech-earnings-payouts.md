---
lang: en
key: fintech-earnings-payouts
order: 2
kicker: Fintech · Earnings & payouts
title: Earnings & payout engine for a US fintech rewards platform
summary: A multi-level referral network, an earnings engine and ledger-style payouts — rolled out white-label for a Latin American distributor.
facts:
  role: Backend lead
  company: US fintech client via Road9 (under NDA)
  stack: [Python, Django/DRF, PostgreSQL, Celery, Kubernetes (GKE)]
  scope: [Earnings, Ledger, Payouts, Multi-tenancy]
problem: A rewards and referral platform pays members for referrals across several levels of the network they build. Every earning had to be calculated correctly, every payout had to be traceable, and the platform had to launch for new distributors under their own brand.
myRole: I grew into leading the backend. I modelled the referral network, built the earnings engine, ledger-style transactions and payouts, and led the multi-tenant white-label rollout for a Latin American distributor — working directly with the client on technical design and coordinating the team's delivery.
diagram:
  width: 1000
  height: 360
  description: Web and mobile apps call a multi-tenant Django REST API backed by PostgreSQL, which holds the referral network and the ledger. The API hands heavy work to Celery workers, which calculate earnings, write ledger entries to PostgreSQL, and send payouts and notifications through external providers.
  nodes:
    - { id: apps, x: 40, y: 40, label: Web & mobile apps, sub: members · admins }
    - { id: api, x: 380, y: 40, label: Django REST API, sub: DRF · multi-tenant, highlight: true }
    - { id: pg, x: 720, y: 40, label: PostgreSQL, sub: referral network · ledger }
    - { id: external, x: 40, y: 232, label: Payout providers, sub: "& notifications" }
    - { id: workers, x: 380, y: 232, label: Celery workers, sub: earnings · payouts · alerts, highlight: true }
  edges:
    - { from: apps, to: api, points: [[280, 84], [379, 84]] }
    - { from: api, to: pg, points: [[620, 84], [719, 84]] }
    - { from: api, to: workers, points: [[500, 128], [500, 231]], label: async tasks, labelAt: [512, 184], labelAnchor: start }
    - { from: workers, to: pg, points: [[620, 276], [840, 276], [840, 129]], label: ledger entries, labelAt: [730, 266] }
    - { from: workers, to: external, points: [[380, 276], [281, 276]], label: payouts, labelAt: [330, 266] }
  markers:
    - { n: 1, x: 864, y: 200 }
    - { n: 2, x: 616, y: 232 }
    - { n: 3, x: 956, y: 40 }
    - { n: 4, x: 616, y: 40 }
decisions:
  - title: Money as a ledger, not a balance.
    text: Every earning and payout is recorded as a credit or debit entry and balances are derived from them, so every amount can be traced back to where it came from.
    marker: 1
  - title: Heavy work off the request path.
    text: Celery runs earnings calculation, payouts and notifications in the background, so API requests stay fast and predictable.
    marker: 2
  - title: A referral model built for multi-level earnings.
    text: The referral network is modelled in PostgreSQL so earnings can be calculated across several levels of a member's network.
    marker: 3
  - title: One platform, many brands.
    text: Multi-tenant white-label support let a Latin American distributor launch under its own brand on the same codebase.
    marker: 4
results:
  - { value: Multi-tenant, label: white-label launch for a Latin American distributor }
  - { value: Traceable, label: every earning and payout recorded as a ledger entry }
  - { value: Lead, label: grew from backend engineer to backend lead on the platform }
---
