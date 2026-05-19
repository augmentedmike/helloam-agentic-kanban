> **After Anthropic cut off harnesses to things like this I am working on a Codex, DeepSeek, and Qwen apapters! Will be done by monday.**

# 🚀 AM — Gated Agent Runtime for Engineering & AI Workflows

![GitHub Repo stars](https://img.shields.io/github/stars/augmentedmike/am-agi?style=for-the-badge&logo=github)
![GitHub forks](https://img.shields.io/github/forks/augmentedmike/am-agi?style=for-the-badge&logo=github)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/augmentedmike/am-agi?style=for-the-badge)
![Project Maintenance](https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge)
![Top Language](https://img.shields.io/github/languages/top/augmentedmike/am-agi?style=for-the-badge&logo=typescript)
![MIT License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge&logo=opensourceinitiative)

> **If this is useful to you — [⭐ Star the repo](https://github.com/augmentedmike/am-agi). It costs nothing and helps more people find it.**

## AM — Gated Task Execution Framework with Git-Driven Auditing
![helloam.bot hero screenshot](docs/screenshots/helloam-hero.png)

## AM — Worktree isolation and deterministic CLI
![AM Board](docs/screenshots/board-demo.png)

## AM — Schedule complex engineering workflows
![AM Calendar](docs/screenshots/calendar.png)

*The AM kanban board — every task tracked, every transition gated server-side, worktree isolation per card, and persistent memory with nightly reflection. Each action is a git commit. No black boxes.*

---

## Table of Contents

- [What it actually does](#what-it-actually-does)
- [Features](#features)
- [How you get started](#how-you-get-started)
- [Dog-Fooding](#dog-fooding)
- [Architecture](#architecture)
- [Philosophy](#philosophy)
- [Acknowledgements](#acknowledgements)
- [Contributing](#contributing)
- [License](#license)
- [中文简介](#中文简介--chinese-简体)

---

## What it actually does

AM is a purpose-built, security-gated agent runtime for engineering and AI specialist work. It doesn't just generate text — it orchestrates outcomes via a gated state machine, with worktree isolation, git-audited execution, and persistent memory that survives across sessions.

Each card on the kanban board represents a unit of engineering work. Transitions between states (backlog → in-progress → in-review → shipped) are verified server-side — no agent can mutate state without passing a gate. Every action is a git commit. Every output traces to the exact state that produced it.

This is not a chatbot, a wrapper, or a demo. It's a production agent runtime for people who ship software.

---

## Features

- 🧠 **Persistent memory** — short-term context + long-term embeddings, stored locally. Never re-explain your codebase.
- 📋 **Gated kanban state machine** — server-side gate verification. Every transition is explicit. No implicit moves.
- 🔄 **Git-audited execution loop** — every step is a signed commit. Trace any output back to the exact state.
- 🌿 **Worktree isolation** — each card gets its own git worktree. Parallel work with zero cross-contamination.
- 🌍 **Cross-platform** — Mac, Linux (systemd/OpenRC/runit), and Windows (Task Scheduler).

---

## How you get started

**Mac / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/augmentedmike/am-agi/main/install.sh | bash
```

**Windows:**
```powershell
irm https://raw.githubusercontent.com/augmentedmike/am-agi/main/install.ps1 | iex
```

Both installers clone the repo, install all dependencies, build the board, register background services, and open `http://localhost:4220` when ready. Sign in with your Anthropic account in the onboarding flow and create your first card.

---

## Dog-Fooding

You use Claude Code to bootstrap the first few steps:

```bash
source ./init.sh
# follow steps/1.md → steps/2.md → steps/3.md
```

After step 3, AM does the rest. We find bugs before you do because we build the product with the product.

---

## Architecture

Three things. That's it.

**1. Memory** — Short-term context + long-term embeddings. Stored locally. Traceable. Inspect every vector if you want to.

**2. State** — Kanban-driven gated state machine. Every task has an explicit status. Transitions are verified server-side. Nothing implicitly moves.

**3. Loop** — One-shot iteration per worktree. Commit. Merge. Repeat. If you can't trace the execution, the execution is wrong.

Docs:
- [`docs/AGENT-LOOP.MD`](docs/AGENT-LOOP.MD) — the iteration pattern
- [`docs/KANBAN.MD`](docs/KANBAN.MD) — state machine, gated transitions
- [`docs/CLI.MD`](docs/CLI.MD) — task lifecycle interface

---

## Design Principles

AM is engineered around strict software design and operational principles to ensure reliable, deterministic execution:

- **State-Driven Determinism:** All process states live explicitly in a validated state machine (represented as a Kanban board). The model does not manage state; the system validates transitions.
- **Durable Task Isolation:** Each active card or task operates in a separate Git worktree. This prevents state contamination and enables true parallelized, async workflows.
- **Auditable & Traceable History:** Every action and state transition is captured as an auditable Git commit, making all system-generated changes reproducible and inspectable.
- **Structured Multi-Tier Context:** Implements strict tiering of context storage:
  - *Local Rules (Working Context):* Stateless rule files loaded dynamically.
  - *Indexed Knowledge (Persistent Context):* SQLite Full-Text Search (FTS5) for on-demand knowledge retrieval.
  - *Episodic Log (Git History):* Execution logs committed per iteration to prevent repetitive errors.

---

## Acknowledgements

Built on ideas from:

- **Ken Thompson** · **John McCarthy** · **Jim Weirich**
- **Richard Sutton** · **Yann LeCun**
- **Andrej Karpathy** · **George Hotz**

---

## Contributing

We welcome humans and well-behaved AI agents. See [Contributing Guide](https://github.com/augmentedmike/am-agi/discussions/14).

**Help wanted:**
- [🌏 Chinese model support (Kimi, DeepSeek, Qwen)](https://github.com/augmentedmike/am-agi/discussions/13)
- [🐧 Linux distro testing](https://github.com/augmentedmike/am-agi/discussions/12)
- [🪟 Windows testing](https://github.com/augmentedmike/am-agi/discussions/11)
- [🌍 Translations (French, Portuguese, Japanese, Hindi)](https://github.com/augmentedmike/am-agi/discussions)

---

## License

MIT © [augmentedmike](https://github.com/augmentedmike)

---

## 中文简介 | Chinese (简体)

**AM（AugmentedMe）是一个真正的个人 AI 智能体系统。** 不是框架。不是 SaaS。不是 LangChain 包装器。

这是一个真实运行在生产环境中的系统，完全开源，代码可在下午读完。

| 特性 | 说明 |
|---|---|
| 🧠 **持久记忆** | 短期 + 长期记忆，存储在本地，数据属于你 |
| 📋 **看板状态机** | 每个任务有明确状态，转换有门控，执行可追溯 |
| 🔄 **Git 驱动循环** | 每一步都是可审计的提交，没有黑盒 |
| 🌍 **全平台支持** | Mac / Linux / Windows 均支持，非 Mac 独占 |
| 💰 **低成本可选** | 支持 DeepSeek、Kimi、Qwen 等中国模型——[参与贡献](https://github.com/augmentedmike/am-agi/discussions/13) |

**中文用户专区：**
[🌏 中文本地化讨论](https://github.com/augmentedmike/am-agi/discussions/4) · [🤖 寻求帮助：支持中国模型](https://github.com/augmentedmike/am-agi/discussions/13) · [📌 发帖前请阅读](https://github.com/augmentedmike/am-agi/discussions/15)

⭐ **如果觉得有用，请 Star 支持我们！Star 是我们了解有多少人在关注的重要信号。**
