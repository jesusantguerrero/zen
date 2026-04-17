---
title: "Beyond 'done': task stages in Zen"
date: "2026-04-17"
excerpt: "Why a task being 'complete in dev' isn't the same as shipped, and how Zen's new stages field fixes a dimension generic todo apps don't represent."
author: "Jesus Guerrero"
slug: "introducing-zen-stages"
tags: ["product", "dev-workflow"]
---

# Beyond 'done': task stages in Zen

Most todo apps give you one bit of state: **done** or **not done**. That's enough for "buy milk." It's not enough for real work.

A task can be:
- **exploring** — you're still researching
- **in-dev** — you're building
- **in-review** — waiting on someone
- **in-prod** — shipped, monitoring
- **done** — closed out

The matrix (TODO / SCHEDULE / DELEGATE / DELETE) tells you *priority*. Stages tell you *workflow state*. Both matter. Neither replaces the other.

## What's new

Every task now has an optional `stage` field. You pick it from the task modal (pill selector), and it shows as a small badge next to the title. The Dashboard and Matrix views have a **stage filter** — toggle which stages you want to see.

On the Metrics page, the **Stage Distribution** report shows how many tasks are sitting in each stage. If you see 12 tasks in "in-review" and 2 in "in-dev," you know where the bottleneck is.

## Why optional

Existing tasks stay unlabeled. No migration. No forced workflow. If you only ever want to think in matrix quadrants, stages stay out of your way. If you want the second dimension, it's there.

## What's next

Per-tag custom pipelines (one shape for client work, another for product work) are on the roadmap — but only if people ask for them. The current five stages cover most dev flows.

---

*Zen is free and open-source. If you're a developer juggling too many contexts, [give it a try](/register).*
