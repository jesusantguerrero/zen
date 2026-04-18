import { DateTime } from "luxon";

export type MatrixName = "todo" | "schedule" | "delegate" | "delete" | "backlog";

export interface SuggestableTask {
  title?: string;
  due_date?: Date | string | null;
  created_at?: Date | string | null;
}

export interface MatrixSuggestion {
  matrix: MatrixName;
  reason: string;
}

// Title keywords that strongly imply the task is hand-offable.
// Lowercase; matched as whole-word or substring (see isDelegatish).
const DELEGATE_KEYWORDS = [
  "email",
  "call",
  "ping",
  "remind",
  "ask ",
  "follow up",
  "follow-up",
  "review for",
  "reply to",
  "send to",
  "assign to",
  "delegate",
];

const isDelegatish = (title: string) => {
  const t = title.toLowerCase();
  return DELEGATE_KEYWORDS.some((kw) => t.includes(kw));
};

const toDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
};

/**
 * Heuristic quadrant suggestion. Deterministic, no AI.
 *
 * Rules (first match wins):
 *   1. due_date in the past or today      → TODO        (urgent & important)
 *   2. due_date this week                  → SCHEDULE    (important, not urgent)
 *   3. title matches DELEGATE_KEYWORDS     → DELEGATE
 *   4. created >21 days ago, no due_date   → DELETE      (stale, probably won't happen)
 *   5. default                             → backlog     (user can still prioritize manually)
 *
 * Callers should surface this as a *suggestion* — never auto-apply.
 * The user always has final say (agency > prescription, per our personas).
 */
export function suggestMatrix(task: SuggestableTask): MatrixSuggestion {
  const now = DateTime.now().startOf("day");

  const due = toDate(task.due_date);
  if (due) {
    const dueDay = DateTime.fromJSDate(due).startOf("day");
    const diffDays = dueDay.diff(now, "days").days;
    if (diffDays <= 0) {
      return { matrix: "todo", reason: "Due today or overdue" };
    }
    if (diffDays <= 7) {
      return { matrix: "schedule", reason: "Due this week" };
    }
  }

  const title = task.title?.trim() || "";
  if (title && isDelegatish(title)) {
    return { matrix: "delegate", reason: "Looks like a hand-off task" };
  }

  const created = toDate(task.created_at);
  if (!due && created) {
    const createdDay = DateTime.fromJSDate(created).startOf("day");
    const ageDays = now.diff(createdDay, "days").days;
    if (ageDays > 21) {
      return { matrix: "delete", reason: "Untouched for 21+ days" };
    }
  }

  return { matrix: "backlog", reason: "No strong signal yet" };
}
