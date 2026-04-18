---
title: "Zen 2.0: from productivity app to decision engine"
date: "2026-04-18"
excerpt: "Zen stops pretending to be a generic productivity tool. It's now a decision engine for developers juggling 5+ concurrent projects — and there's a lot new in the box."
author: "Jesus Guerrero"
slug: "zen-2-0"
tags: ["product", "release"]
---

# Zen 2.0: from productivity app to decision engine

Zen started as "keep yourself in the zone." That tagline worked while I was building the matrix and the pomodoro, but once both were stable the real problem surfaced — and it wasn't focus.

It was **decision overhead**.

If you run 5+ concurrent projects (client A, client B, your side project, the thing your partner nags you about, the thing you actually love), the 10 minutes you spend every morning asking "which one today?" add up to an hour a week of wasted pre-work. Zen 2.0 is built around killing that hour.

## The new positioning

> **5 projects. 1 decision.**
> Zen is the decision engine for developers juggling multiple projects.

That's the whole pitch. Everything in 2.0 hangs off it.

## What's new

### Projects are first-class

You no longer wedge project names into tags. Projects have their own model, their own color, their own weekday schedule. Assign Client A to Mondays and Wednesdays, side project to Tuesdays. The dashboard's **Today toggle** filters to only the projects on today's rotation.

That one feature alone is what half the zen-brief was written around.

### Heuristic quadrant classifier

When you quick-add a task, Zen now suggests a matrix quadrant based on deterministic rules:

- Due today or overdue → TODO
- Due this week → SCHEDULE
- Title starts with "email" / "call" / "ping" → DELEGATE
- Untouched for 21+ days → DELETE

It's a pill next to the quick-add. One click to accept. One click to ignore. Zero AI. Zero token cost.

### Top 3 today

The matrix used to give equal visual weight to every TODO. 2.0 splits the TODO tab into **Top 3 today** (prominent) and the rest (dimmed). You wake up to three tasks that are already ranked — not a flat list you still have to triage.

### Dashboard daily summary

Done today, tracked time, streak, overdue, due today, stale, and now a "high-impact" label that reframes completions by quadrant ("2 done — 1 high-impact"). Plus a standup CTA that appears the moment you complete your first task of the day, so the execute → summarize loop closes inside the dashboard.

### MCP server

Zen ships an MCP server so Claude, Cursor, or any agent can drive it. Six tools — `add_task`, `move_task`, `complete_task`, `start_timer`, `get_standup`, `get_metrics`. You ask Claude "what should I work on today?" — it answers using your real matrix across all your projects. Nobody else has this.

### Command palette (Cmd/Ctrl+K)

Ten commands registered by default. Navigate, toggle theme, log out, open shortcuts. Adding your own takes two lines.

### Everything else

- **Swipe gestures** on mobile (right = complete, left = delete)
- **PWA install** + offline Firestore persistence
- **Focus mode** (Shift+F) — fullscreen single-task view
- **Email digest** + **desktop push notifications** opt-in
- **Keyboard shortcut panel** — press `?` anywhere
- **Data export** (tasks + tracks, JSON/CSV)
- **Dark/light toggle** (with proper SCSS overrides this time)
- **Deprecated the `/timer` route** because the timer lives in Zenboard

## What's coming next

- Cross-project **Top 3 today** — the real decision engine (currently within-TODO only)
- Overload diagnostics that narrate the matrix to you ("12 active TODOs, 2 from today's scheduled projects")
- AI-augmented features behind a per-user quota system — standup writer, weekly retro narrative, smart quadrant suggestion, stale-task triage
- Stripe, Pro tier, and the actual paid plan

These are in the [public backlog](https://github.com/jesusantguerrero/zen) if you want to follow along.

## How to try it

Free forever for the daily-driver features. No credit card. No team seat dance.

[**Plan my first day →**](/register)

*Zen is MIT-licensed and built in public. Issues, PRs, and roadmap suggestions all welcome on [GitHub](https://github.com/jesusantguerrero/zen).*
