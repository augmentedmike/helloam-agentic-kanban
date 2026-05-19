# Architectural Decision Records (ADRs)

This document tracks significant architectural decisions made in the AM project, detailing the engineering tradeoffs, alternatives considered, and rationale behind each decision.

---

## ADR 001: Deterministic Kanban Board State Machine vs. Fully Autonomous Loops

### Status
**Accepted**

### Context
Autonomous LLM-driven agents frequently enter infinite execution loops, make unauthorized filesystem changes, or fail to self-correct during compiler failures when allowed to run with absolute autonomy. We needed a mechanism to govern agent loops and enforce human-in-the-loop quality gates.

### Decision
We rejected a fully autonomous "free-loop" model in favor of a formalized, gated task state machine represented as a physical Kanban board. Cards represent standard software tasks. Transitions are verified server-side.

### Rationale & Tradeoffs
* **Pros:** Guarantees absolute safety and determinism. Tasks can be gated with static assertions (e.g., must have a `criteria.md` before starting, must pass `bun test` before shipping).
* **Cons:** Increases the friction of task startup; developers must explicitly define tasks and criteria beforehand. However, this is an acceptable tradeoff for enterprise reliability.

---

## ADR 002: Multi-Tier Context Partitioning vs. Unified Global Vector Memory

### Status
**Accepted**

### Context
Standard agent architectures rely on a single vector search database where all context is embedded and queried. This frequently leads to "lost in the middle" phenomena, context pollution (irrelevant code matching and inflating prompt sizes), and lack of deterministic rule enforcement.

### Decision
We partition context into three strictly separate tiers:
1. **Active Rules (Static Directory):** Injected unconditionally to enforce immutable rules.
2. **Durable Knowledge (SQLite FTS5):** Queried dynamically via full-text search.
3. **Episodic Execution Log (Git History):** Committed per iteration to prevent repetition of immediate compiler errors.

### Rationale & Tradeoffs
* **Pros:** Keeps token usage extremely low and prompt context highly precise. Enforces strict compliance to global rules.
* **Cons:** Requires explicit design of rules and search boundaries, making the context storage logic more complex than a standard vector database wrapper.
