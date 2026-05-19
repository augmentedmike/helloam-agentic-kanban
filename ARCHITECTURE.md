# System Architecture: AM Task Execution Framework

AM is designed as a highly deterministic, offline-first task execution framework. Instead of relying on raw LLM reasoning loops, AM implements strict state boundaries, multi-tiered context persistence, and filesystem-level isolation to ensure predictable execution in production development environments.

---

## 1. High-Level Architecture Overview

The system is split into three decoupled operational layers:

```
            ┌───────────────────────────────────────┐
            │         Human / Steering CLI          │
            └───────────────────┬───────────────────┘
                                │ API/WS
                                ▼
            ┌───────────────────────────────────────┐
            │   Gated State Machine (Kanban Board)  │
            └───────────────────┬───────────────────┘
                                │ Worktree Hook
                                ▼
            ┌───────────────────────────────────────┐
            │     Git Worktree Execution Engine     │
            └───────────────────┬───────────────────┘
                                │ File Operations
                                ▼
            ┌───────────────────────────────────────┐
            │    Multi-Tier Context Storage Layer   │
            └───────────────────────────────────────┘
```

---

## 2. Gated State Machine (Task Orchestration)

To prevent models from spinning out of control or making unstructured mutations, AM leverages a formal state machine represented physically as a Kanban board (`apps/board/`).

* **State Boundaries:** Tasks are confined to four distinct states: `backlog` ➔ `in-progress` ➔ `in-review` ➔ `shipped`.
* **Server-Side Verification:** Task transitions cannot be directly mutated by the execution loop. Every change is verified server-side via validation scripts.
* **Operational Gates:**
  * To leave `backlog`, a clear `criteria.md` defining requirements must be present.
  * To leave `in-progress`, all associated unit tests must pass and the code must build.
  * To move to `shipped`, manual or automated verification against acceptance criteria is enforced.

---

## 3. Multi-Tier Context Storage Layer

Standard LLMs are stateless across requests. AM implements a durable, local-first context storage engine modeled to keep execution precise while preventing context window bloat:

| Context Tier | Storage Subsystem | Access Pattern | Lifecycle |
|---|---|---|---|
| **Active Rules** | Local directory (`workspaces/memory/st/`) | Injected unconditionally into every execution prompt | Static files |
| **Durable Knowledge** | SQLite (with FTS5 Full-Text Search) | Queried dynamically via vector/text ranking | Persistent DB |
| **Episodic Execution Log** | Git Commit History & Execution Logs | Read on demand to prevent repeating past failures | Git repository |

### Detailed Subsystems:

1. **Active Rules (Static Context):**
   * Placed in `workspaces/memory/st/*.md`.
   * Holds project constants, formatting rules, and static team standards. Injected unconditionally to guarantee immediate compliance.

2. **Durable Knowledge (Searchable Context):**
   * Stored in `workspaces/memory/lt/memory.db`.
   * Designed for high-volume reference documents, research, and dependency docs. Queried on demand by the executor using text search and vector indexing.

3. **Episodic Log (Git History Context):**
   * Captures step-by-step logs of execution attempts, CLI outputs, and compiler errors.
   * When an attempt fails, the execution loop records the failure in `iter/*/agent.log` and commits it. In subsequent iterations, the agent reads these logs to dynamically adjust its strategy.

---

## 4. Git Worktree Isolation & Auditing

A common issue in automated tooling is file contamination. AM guarantees safety through filesystem-level sandboxing:

* **Worktree Sandboxing:** Every card selected for execution is checked out in an isolated Git worktree (`git worktree add`).
* **Traceable Execution Loops:** Each atomic step inside the execution engine generates an isolated, local Git commit. This makes every modification fully traceable and allows developers to easily revert any step of the run.
* **Consolidation on Ship:** Once validation gates pass, individual step commits are squashed into a single clean commit on the target branch.
