# Contributing to AM

Thank you for your interest in contributing to AM! We are committed to fostering a collaborative, team-oriented development environment with high standards for software design, reliability, and engineering rigor.

---

## Code of Conduct

We expect all contributors—both human developers and AI assistants—to maintain professional, respectful, and productive communication.

---

## Development & Git Workflow

We use a structured, test-driven development workflow designed to protect system stability and maintain a clean git history.

### 1. Branching Strategy
* Target the `main` branch for all pull requests.
* Use descriptive branch names: `feature/name-of-feature` or `bugfix/issue-id`.
* Every task in AM is managed via the Kanban state machine (`apps/board/`). Contributors are encouraged to create cards for new work items before starting execution.

### 2. Worktree Isolation
When working on features, we recommend using Git worktrees to isolate parallel tasks:
```bash
git worktree add ../am-my-feature feature/my-feature
```

---

## Code Review Expectations

All pull requests are reviewed with a focus on **operational reliability** and **maintainability**:
* **Explicit Interfaces:** Avoid global state and undocumented runtime assumptions. Depend on explicit APIs and interface boundaries.
* **Traceability:** Ensure all custom CLI actions print structured logs (JSON where appropriate) to integrate cleanly with downstream observability tools.
* **No Speculative Hype:** Do not introduce speculative or non-deterministic loops. Keep all prompt orchestration deterministic, using state validation gates.

---

## Testing Strategy

Robust test coverage is critical to preventing regression in prompt handling and task execution.

### 1. Writing Tests
* Write unit tests for new utility functions and service modules.
* Focus heavily on integration tests for state machine transitions.
* Mock external LLM API calls using predefined fixtures.

### 2. Running the Test Suite
Before submitting your PR, verify all tests pass:
```bash
bun test
```

---

## CI/CD Pipeline

Every pull request triggers our automated GitHub Actions workflow to verify code health:
* **Linter & Formatter Check:** Validates code matches project standards (`eslint` and `prettier`).
* **Static Analysis:** Runs Typecheck to catch compilation and schema errors.
* **Test Suite execution:** Executes all unit and integration tests under isolated environments.

---

## Release Management

We follow strict Semantic Versioning (`vMAJOR.MINOR.PATCH`):
* **Minor Releases:** Feature additions or changes to prompt adapters.
* **Patch Releases:** Bug fixes, library updates, or documentation improvements.
* All releases are tagged using standard Git tags and published with structured release notes.
