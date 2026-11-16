---
lang: en
key: payment-integration
order: 2
icon: payments
title: Payment gateway integration
summary: Connect a payment gateway so money moves correctly — including the cases where the gateway times out or calls back twice.
deliverables:
  - Payment flow with unique references, so retries never double-charge
  - Callback / webhook handling with signature checks where the gateway supports them
  - Pending-status handling and a reconciliation report
  - Test plan covering success, failure and timeout scenarios
---
