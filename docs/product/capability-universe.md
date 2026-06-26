# Supagen Capability Map

This document maps the broad product capability universe Supagen may support in
its complete form. It is not an MVP, v1, or v2 requirements document.

Supagen is a multi-modal AI gateway and AI backend for early-stage product
teams and solo founders. It should make AI integration feel as direct as
Supabase makes backend integration: product frontends can call Supagen directly
when appropriate, while Supagen handles OAuth, access control, metering, keys,
templates, routing, observability, assets, and billing controls.

Version scopes such as MVP, v1, v1.1, and v2 should be distilled later into
separate plans or PRDs. A capability listed as definite here is part of the
intended product universe, not a commitment to any specific release, early-build
priority, or first-class implementation module.

## Classification

- Definite capabilities: Supagen should support these in its complete product
  direction.
- Possible / future capabilities: Supagen may support these, but the product
  boundary or value still needs validation.
- Explicitly rejected / non-goal capabilities: Supagen should not become these
  products or expose these abstractions.

## Definite Capabilities

### Product Frame

- Multi-modal AI gateway for text, image, audio, video, files, tools, and
  provider-specific model capabilities.
- AI backend for customer applications, allowing direct frontend integration
  where Supagen manages customer-app end-user auth, access control, metering,
  and invocation policy.
- Both backend-mediated invocation, where a customer backend calls Supagen, and
  frontend-direct invocation, where a customer app frontend calls Supagen with
  Supagen-managed auth, access control, metering, and frontend-safe policy.
- All-in-one AI infrastructure layer around provider access, templates,
  routing, keys, governance, observability, usage attribution, assets, and
  billing controls.
- Product surfaces for early-stage product teams, solo founders, founders,
  product engineers, backend engineers, and AI/product builders.

### Tenancy, Identity, And Access

- Organization and workspace management.
- Default organization and workspace creation during signup.
- Workspace-scoped operational resources, including provider keys, invocation
  templates, generation logs, usage/cost data, Supagen API keys, experiments,
  assets/files, and configuration.
- Dashboard role-based access control. Simple Owner/Admin/Member roles are an
  early slice, not the full capability boundary.
- Customer-app end-user and tenant identity support for both B2B application
  tenants and B2C application users.
- Customer-app end-user access control for deciding which app users or tenants
  may use which Supagen-backed AI capabilities.
- Cost and usage attribution to customer-app end users and tenants.
- Explicit authorization behavior across organizations, workspaces, templates,
  logs, assets, billing, provider keys, invocation API keys, and MCP actions.
- Workspace-scoped Supagen invocation API keys.
- Organization, workspace, billing account, subscription, credit, deletion, and
  account-recovery lifecycle controls.

### Modalities And AI Operations

- Text and language generation as multi-turn generation.
- Text operation support for system instructions, message/input history,
  generation configuration, structured outputs, reasoning/thinking, tool use,
  image inputs, audio inputs, video inputs, and file inputs where supported by
  the selected provider/model.
- Text-output understanding and transformation tasks, including summarization,
  rewriting, classification, extraction, translation, code generation/review,
  image understanding, audio transcription/summarization/understanding, video
  understanding, and document/file understanding when the output is text or
  structured data.
- Broad image generation and editing using text and/or image inputs where the
  selected provider/model supports them.
- Broad video generation and editing using text, image, and/or video inputs
  where the selected provider/model supports them.
- Audio generation, including text-to-speech and audio-to-audio flows.
- Audio-to-audio families such as translation, voice cloning, voice conversion,
  enhancement, and noise removal.
- Realtime audio and realtime video.
- Realtime session lifecycle and bidirectional event/protocol semantics for
  realtime audio/video, including auth, metering, and close/cancel behavior.
- Sync invocation execution.
- Async invocation execution with job submission, status polling, cancellation,
  and terminal statuses such as queued, running, completed, failed, and
  cancelled.
- Direct invocations without templates.
- Template-backed invocations.

### Tools, MCP, Agents, And Workflows

- Custom function/tool calling inside model invocations.
- Built-in tool access where available, including web search, code
  interpreter-style execution, and browser/computer use.
- MCP tool discovery and execution inside supported invocation flows.
- Supagen MCP server for coding-agent integration.
- Coding-agent skills and instructions for Codex, Claude, and other coding
  agents.
- Agent building and no-code workflow building.
- Workflow orchestration with atomic invocations, DAGs, conditional/logical
  branching, state, human approvals, resumability, and long-running flows.

### Invocation Templates

- Operation-specific invocation templates for text, image, audio, video, and
  other supported operation families.
- Templates as reusable invocation blueprints, not only text prompts.
- Template fields for instructions/prompts, model/provider selection,
  generation parameters, variables, input schema, output schema, tool
  definitions, enabled built-in tools, MCP tool configuration, fallback policy,
  cache policy, and operation-specific configuration.
- Template variables with schema generation and invocation-time validation.
- Template draft and published states.
- Template versioning, immutable published versions, and clone/new-version flows
  for modifying published behavior.
- Active published template version selection, with callers able to specify an
  explicit version when needed.
- Template editing through UI, API, and Supagen MCP surfaces.

### Providers, Models, Keys, And Catalog

- Built-in provider integrations across the main text, image, audio, and video
  provider landscape.
- Provider coverage including OpenAI, Anthropic, Google Gemini, ElevenLabs,
  FalAI, DeepSeek, Moonshot AI, Minimax, Alibaba/Qwen, xAI, zAI, OpenRouter,
  Groq, and additional providers as the product expands.
- BYOK provider keys scoped to workspaces.
- Multiple workspace keys for the same provider.
- Supagen global provider keys funded by organization-level AI credits.
- Funding-source resolution before invocation execution.
- Fallback from Supagen credits/global keys to BYOK where appropriate when
  credits are exhausted.
- Encrypted provider key storage.
- Provider key retry and rotation for authentication, rate-limit, quota,
  network, and provider errors.
- Supagen-owned provider and model catalog.
- Catalog metadata for model name, description, modalities, context limits,
  rough pricing, capabilities, supported parameters, tool support, structured
  output support, and other selection factors.
- Catalog enrichment using provider model APIs plus Supagen-maintained model and
  pricing datasheets.
- Internal Supagen-superuser management of provider/model/pricing metadata.

### Routing And Gateway Execution

- Explicit provider/model selection in direct invocations and templates.
- Automatic provider/model routing, including a future auto selector that can
  choose based on capability, policy, health, cost, latency, or other routing
  factors.
- Fallback policies for template-backed and direct invocations.
- Retry behavior with sensible defaults.
- Workspace-level and template-level retry configuration as the product matures.
- Provider health checks.
- Provider circuit breakers.
- Provider-level performance and reliability stats.
- Per-provider queues for concurrency control, backpressure, failure
  containment, and lifecycle management.
- Gateway/meta operations that manage the gateway itself separately from model
  generation operations.

### Streaming, Realtime, And Events

- Text streaming.
- SSE-compatible streaming where appropriate.
- Audio streaming.
- Stream failure behavior that can surface a terminal error and mark output as
  partial.
- Trace IDs, event IDs, request IDs, and correlation IDs for later lookup.
- Trace/event IDs across sync requests, streaming requests, and async jobs.
- Streaming and async conventions in the public API contract.

### Context, Inputs, Files, And Assets

- File and media inputs by public URL, base64 payload, or Supagen-uploaded asset
  ID.
- Supagen translation from its own asset/file IDs to provider-specific file
  representations when providers require that internally.
- File and asset storage for uploaded input files, uploaded input media,
  generated images, generated audio, generated video, and raw payload assets
  where applicable.
- File and asset retrieval.
- Format transformations for provider compatibility and product workflows.
- Workspace-scoped asset access control.
- Generated output storage configuration at workspace and template level, with
  template-level configuration taking precedence.
- Signed URLs for asset access.
- Asset deletion.
- Asset reuse across later invocations by Supagen asset ID.
- Reusable conversation/session state.
- Caller-supplied full context for stateless request patterns.

### Observability, Debugging, Quality, And Evaluation

- Invocation logs for every invocation.
- Always-logged non-sensitive invocation metadata, including provider, model,
  template/version, latency, cost, usage, errors, trace ID, and end-user
  identifiers.
- Configurable storage of sensitive invocation content, including inputs,
  rendered prompts/instructions, outputs, and raw provider request/response
  payloads.
- Workspace-level and template-level logging/storage configuration.
- Log filtering and search by useful dimensions such as template, model, time
  range, and ordering.
- Usage and cost visibility from a single place.
- Experimentation and evaluation.
- A/B testing, shadow mode, traffic splitting, cohort targeting, side-by-side
  model/template comparison, quality scores, evals, LLM-as-judge, manual rating
  workflows, and prompt/template test cases.

### Cost, Usage, Metering, Limits, And Billing

- Precise post-completion cost calculation.
- Cost calculation from provider-returned usage plus Supagen-maintained pricing
  datasheets.
- Cost attribution by workspace, template, model, provider, customer-app end
  user/tenant, and Supagen invocation API key.
- Usage metering beyond cost, including request counts, token counts, audio
  duration, image counts, video duration, storage usage, bandwidth, and
  provider-specific billable units.
- Usage and cost reporting.
- Billing export so customers can bill, analyze, or reconcile usage for their
  own users and tenants.
- Metering and export support for customer billing workflows, without Supagen
  collecting payments from, generating invoices for, or managing receivables for
  the customer's own end users.
- Customer-app end-user and tenant request/rate quotas.
- Customer-app end-user and tenant spend quotas.
- Platform-level abuse protection and rate limiting.
- Supagen customer billing.
- Monthly platform subscription tiers.
- Usage-based prepaid AI credits purchased through ad hoc purchases/recharges.
- Organization-level AI credit balances.
- Credit consumption by workspaces under the organization.
- Dodo Payments integration for payments, invoices, and receipts.

### Caching And Optimization

- Exact-match response caching.
- Semantic caching.
- Template-version cache invalidation.
- Cached media outputs.
- Cost optimization.
- Latency optimization.
- Cost/latency-aware routing where appropriate.

### Security, Privacy, Compliance, And Governance

- Supagen dashboard authentication.
- Email/password authentication with email verification.
- Google OAuth.
- Secure invocation API key creation, display, hashing, redaction, and
  management.
- Audit logs for platform actions.
- Audit coverage for template edits, provider key changes, billing changes,
  invites, membership changes, workspace/org changes, and API key
  creation/deletion.
- Guardrails and safety controls.
- Prompt injection detection.
- Output guardrails.
- Data governance and privacy controls.
- Customer data handling policies.
- Provider-side retention implications.
- Sensitive input/output handling controls.
- Consent semantics for prompt, media, and log storage.
- Policies for data usage in analytics.
- Policies for data usage in training, if any.
- Organization and workspace deletion with cascading cleanup.

### Collaboration And Change Management

- Template permissions through dashboard role-based access control.
- Template creation and publishing controls.
- Workspace member invites through email links.
- Audit-backed change management for provider keys, API keys, billing changes,
  template changes, workspace changes, organization changes, and membership
  changes.

### Developer Experience And Interfaces

- Normalized Supagen REST API.
- OpenAI-compatible API where operations map cleanly.
- Anthropic-compatible API where operations map cleanly.
- Supagen UI/dashboard.
- Supagen MCP server.
- REST-first integration paths.
- Compatibility with existing OpenAI and Anthropic SDKs where applicable.
- Customer-facing product and integration documentation.
- Coding-agent-facing docs, skills, and instructions.
- Internal project and architecture documentation for Supagen development.
- UI coverage for product capabilities.

### Public API Contract Governance

- API versioning strategy.
- Backward compatibility expectations.
- Error response model and error codes.
- Idempotency behavior for create, submit, and payment-sensitive operations.
- Pagination and filtering conventions.
- Request IDs, trace IDs, and correlation IDs.
- Sync and async API conventions.
- Streaming/SSE event naming and shape.
- Provider-compatible API behavior boundaries.
- Deprecation policy.
- Rate-limit response headers and quota error semantics.
- Auth conventions for user sessions and invocation API keys.
- Stable resource ID format conventions.

### Deployment And Operations

- SaaS product distribution.
- Reliable hosted operation.
- Background workers for async jobs, cost calculation, billing sync, asset
  processing, and similar asynchronous platform work.
- Internal monitoring for general service health.
- Internal monitoring for provider integration health.

## Possible / Future Capabilities

These capabilities remain plausible, but the product boundary, customer value,
or exact shape still needs more validation.

### Tenancy And Access

- Additional hierarchy layers such as projects, apps, or environments.
- More granular dashboard roles and permissions beyond the initial role set.
- Fine-grained invocation API key scopes.

### Modalities And Operations

- Embeddings.
- Reranking.
- Batch operations.
- Specialized document/file operations beyond text-generation-with-file-input.
- Specialized image operations such as explicit variation, inpainting,
  outpainting, upscaling, segmentation, restoration, and background operations.
- Dedicated memory/context management beyond saved sessions and caller-supplied
  context.

### Templates, Collaboration, And Change Management

- Environment-specific template variants.
- Template approval workflows.
- Template diff views.
- Template changelogs/history UI.
- Template rollback flows.
- Approval workflows for provider keys, API keys, and billing changes.
- Comments.
- In-app notifications.

### Providers, Catalog, And Gateway Controls

- User-defined custom providers.
- Per-key model allowlists and blocklists.
- Customer-editable provider/model/pricing metadata overrides.
- Customer-configurable timeout settings.

### Streaming And Events

- Async job lifecycle webhooks.
- WebSockets as a specific realtime/streaming transport choice.
- Async progress events and streaming progress updates.
- Generic cross-modality stream event model.
- Video stream event model for non-realtime generated video flows.
- Detailed audio stream event model for non-realtime generated audio flows.
- Webhook/event naming conventions for deferred webhook features.

### Context, Assets, And Storage

- Pre-flight token counting.
- Automatic context truncation.
- Automatic context summarization.
- Automatic context-window fitting.
- Asset expiry and retention policies.
- Asset metadata search and filtering.

### Observability, Privacy, And Cost Controls

- Detailed multi-span trace breakdowns for template render time, queue time,
  provider latency, retry/fallback spans, and related internals.
- Replay debugging.
- Automated redaction and PII policies.
- Pre-flight cost projection.
- Lane-based cost breakdowns.
- Supagen organization-level budgets and spend caps.
- Low-balance alerting.

### Billing, Compliance, DX, And Operations

- Exact subscription tier definitions.
- Formal compliance targets.
- A specific managed auth provider such as Clerk.
- Official Supagen SDKs.
- CLI.
- Local mock mode.
- High availability and zero-downtime infrastructure.
- Backups and restore.
- Region and data residency requirements.

## Explicitly Rejected / Non-Goal Capabilities

- Model training platform.
- Model hosting platform.
- Billing system for Supagen customers to collect payments from their own end
  users.
- Public provider-native file IDs as Supagen's file abstraction.
- Mandatory customer-backend mediation for all Supagen calls.
- Seat-based SaaS pricing.
- Open-source Supagen distribution.
- Self-hosted Supagen distribution.
