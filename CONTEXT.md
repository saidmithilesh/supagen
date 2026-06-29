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

### Observability

**Observability**:
The customer-facing Supagen product area that helps workspaces inspect, debug, evaluate, and govern invocations and their outcomes. It is not the name for Supagen's own service logs, traces, or metrics.
_Avoid_: Runtime telemetry, application telemetry, developer observability

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
