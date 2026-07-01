# Supagen Context

Supagen is a multi-modal AI gateway for product teams. This context defines the shared product and platform language used across the codebase and engineering docs.

## Language

### Invocation

**Invocation**:
A request to Supagen to execute an AI generation or related AI operation on behalf of a workspace, whether direct, template-backed, synchronous, or asynchronous.
_Avoid_: Request, generation request

**Invocation Log**:
A customer-facing record of a Supagen invocation, containing durable invocation metadata and, depending on policy, selected sensitive content or provider payloads.
_Avoid_: Runtime log, application log, audit log

**Invocation Trace**:
A customer-facing breakdown of one invocation's execution path, such as template rendering, queue time, provider latency, retries, fallbacks, and asset handling.
_Avoid_: Runtime trace, OpenTelemetry trace

**Supagen-Funded Invocation**:
An invocation where Supagen pays the AI provider and recovers the charge amount through AI credits.
_Avoid_: Paid invocation, credit invocation, billable invocation

**Charge Amount**:
The final USD amount Supagen applies to a Supagen-funded invocation for AI credit consumption.
_Avoid_: Provider cost, price, fee

### Providers, Models, And Catalog

**AI Provider**:
An external AI service or routing network that Supagen can use to execute invocations.
_Avoid_: Provider, identity provider, payment provider

**AI Gateway**:
An AI provider that routes invocations to other serving providers and exposes its own model catalog, provider choices, and request-shaping rules.
_Avoid_: AI provider, model author, provider router

**Upstream Serving Provider**:
An AI service that actually serves a model behind an AI gateway's routing layer. It may also be an AI provider that Supagen can integrate with directly in a future route.
_Avoid_: AI gateway, model author, provider

**Model Author**:
The organization or entity that creates or owns the original AI model lineage, independent of which AI providers serve that model through their APIs.
_Avoid_: AI provider, vendor, model host

**Catalog Model**:
An AI model known to Supagen and described by normalized catalog metadata for discovery, validation, routing, and cost-related workflows.
_Avoid_: Model, database model, frontend model

**Model Catalog**:
Supagen's owned directory of AI providers and catalog models. It supports public model discovery, pre-invocation validation, routing decisions, and future cost calculation workflows.
_Avoid_: Frontend catalog, static model list, provider model API

**Catalog Model Capability**:
A user-facing capability that Supagen can positively identify for a catalog model, such as reasoning, reference images, voice selection, or text embeddings. Capabilities are discovery signals, not exhaustive unsupported-feature declarations.
_Avoid_: Supported parameter, provider flag, raw feature field

### Observability

**Observability**:
The customer-facing Supagen product area that helps workspaces inspect, debug, evaluate, and govern invocations and their outcomes. It is not the name for Supagen's own service logs, traces, or metrics.
_Avoid_: Runtime telemetry, application telemetry, developer observability

### IAM And Tenancy

**Supagen User**:
A human user recognized by Supagen for dashboard and product access. Customer-app end users are not Supagen users.
_Avoid_: User, customer-app user, Clerk user

**External Identity**:
A provider-owned login identity linked to a Supagen user by provider and subject.
_Avoid_: Supagen user, principal, identity

**Supagen Identity Provider**:
An external authentication system that authenticates Supagen users and supplies verified identity claims.
_Avoid_: Customer-app identity provider, identity provider

**Organization**:
A customer-owned product boundary that contains members, workspaces, and shared Supagen resources.
_Avoid_: Account, tenant, org

**Workspace**:
An operational scope inside an organization for Supagen resources such as templates, provider keys, invocation API keys, assets, logs, usage, cost data, and configuration.
_Avoid_: Project, app, environment

**Organization Membership**:
The relationship between a Supagen user and an organization.
_Avoid_: Membership, workspace membership

**Organization Role**:
The role held by a Supagen user through an organization membership.
_Avoid_: Membership role, billing role, entitlement

**Authenticated Request**:
A request with a valid credential that Supagen can resolve to an authenticated caller.
_Avoid_: Authorized request, logged-in request

### Billing

**Billable Account**:
The commercial boundary through which an organization pays Supagen and owns billing history, commercial state, and billing entitlements such as AI credits and platform access. Every organization has a billable account, but a billable account is not the same concept as an organization.
_Avoid_: Organization account, billing organization, customer account

**External Billing Customer**:
A payment-provider representation of a Supagen billable account.
_Avoid_: Billable account, Dodo customer, customer account

**External Payment Artifact**:
A payment-provider checkout, payment, invoice, receipt, or related record that supports a Supagen billing event. Invoices and receipts are owned by the payment provider unless Supagen later adds its own billing document surface.
_Avoid_: Recharge, billable account, AI credit movement

**Commercial State**:
The billing-owned state of a billable account that reports whether the account is commercially available or blocked for paid Supagen resources.
_Avoid_: Organization state, membership state, account status

**Billing Entitlement**:
A commercial right or allowance held by a billable account because of a purchase, grant, subscription, or contract.
_Avoid_: Permission, benefit, feature flag

**Entitlement Check**:
A billing query that reports a billable account's commercial state and relevant entitlement values, such as AI credit balance, for another domain to interpret. It does not decide whether that domain's action is allowed.
_Avoid_: Authorization check, permission check, allow/deny decision, IAM check

**Platform Fee**:
Recurring pricing for access to Supagen platform resources and capabilities. Platform fees are separate from AI credit balances.
_Avoid_: AI credits, usage credits, recharge

**AI Credit Balance**:
A USD-denominated prepaid balance owned by a billable account and available for Supagen-managed AI provider usage for the workspaces under that account. It represents Supagen usage value, excluding tax and payment processor charges, and AI credits do not expire in the initial product model.
_Avoid_: Token balance, provider balance, wallet

**AI Credit Origin**:
The commercial origin of AI credit value, such as purchased recharge or grant. It distinguishes customer-paid value from non-purchased value for refund and adjustment decisions.
_Avoid_: Funding source, payment source, balance type

**AI Credit Recharge Intent**:
A Supagen user-initiated attempt by a billable account to buy AI credits before payment success is confirmed. It may expire or fail and does not change an AI credit balance.
_Avoid_: Recharge, payment, checkout

**Minimum Recharge Amount**:
The smallest AI credit recharge amount Supagen will accept. Customers may choose the recharge amount as long as it meets or exceeds this threshold.
_Avoid_: Recharge package, credit package, fixed top-up

**AI Credit Recharge**:
An ad hoc purchase owned by a billable account that increases an AI credit balance by the purchased Supagen usage value after payment-provider success is confirmed.
_Avoid_: Top-up, credit purchase, payment

**AI Credit Grant**:
An AI credit movement that increases an AI credit balance without a customer payment, such as onboarding, promotional, support goodwill, migration, or test credit. Billing records the grant, while the requesting domain owns grant amount and eligibility policy.
_Avoid_: Recharge, coupon, discount

**Onboarding Credit Grant**:
A specific AI credit grant requested by the onboarding flow and recorded by Billing. Onboarding owns the grant amount, eligibility, claim timing, and claimant policy.
_Avoid_: Trial balance, free tier, automatic credits

**AI Credit Movement**:
A classified increase or decrease to an AI credit balance, such as a recharge, consumption, refund, grant, or adjustment.
_Avoid_: Balance mutation, payment, transaction

**AI Credit Movement Cause**:
The structured business reason or source that explains why an AI credit movement exists.
_Avoid_: Free-text note, comment, description

**Payment Refund**:
A money movement through a payment provider that returns collected funds to the payer. Cash refunds for unused purchased AI credits happen through payment refunds, not AI credit refunds, and require a matching AI credit movement that removes the refunded usage value.
_Avoid_: Credit refund, balance refund, adjustment

**Payment Dispute**:
An external payment-provider dispute, chargeback, or reversal process that challenges or reverses collected funds outside Supagen's normal refund flow.
_Avoid_: Payment refund, AI credit refund, support adjustment

**AI Credit Refund**:
An AI credit movement that increases or restores an AI credit balance without itself returning money to the payer. Granted AI credits are not cash-refundable.
_Avoid_: Payment refund, chargeback, reimbursement

**AI Credit Consumption**:
An AI credit movement that decreases a billable account's AI credit balance for incurred Supagen-managed AI provider usage after a USD charge amount has been calculated. Consumption is always attributable to a workspace, may carry additional attribution dimensions, and is corrected by separate AI credit movements rather than being undone.
_Avoid_: Usage charge, spend event, cost calculation

**AI Credit Adjustment**:
An AI credit movement made to correct or administratively change an AI credit balance outside the normal recharge, consumption, grant, or refund flows.
_Avoid_: Edit, overwrite, mutation

**AI Credit Overrun**:
A bounded negative AI credit balance caused by final post-invocation cost exceeding available credits or the pre-invocation estimate. It is a visible settlement exception, not a postpaid credit line.
_Avoid_: Credit line, debt, postpaid balance

### Runtime Telemetry

**Runtime Telemetry**:
Internal operational signals produced by Supagen services for Supagen engineers to inspect service health and behavior. It includes service logs, runtime traces, and metrics, and must not be treated as customer-facing observability.
_Avoid_: Observability, customer observability, invocation logging

**Runtime Log**:
A structured internal log emitted by a Supagen service during execution for engineering inspection.
_Avoid_: Invocation log, audit log

**Runtime Trace**:
An internal trace of Supagen service execution used by Supagen engineers to diagnose request flow, errors, and dependency latency.
_Avoid_: Invocation trace, customer trace
