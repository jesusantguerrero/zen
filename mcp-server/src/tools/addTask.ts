import { z } from "zod"
import { apiRequest } from "../apiClient.js"

export const addTaskSchema = {
  title: z.string().min(1).describe("Task title"),
  matrix: z
    .enum(["todo", "schedule", "delegate", "delete", "backlog"])
    .default("backlog")
    .describe("Eisenhower quadrant. 'backlog' if unprioritized."),
  due_date: z
    .string()
    .datetime()
    .optional()
    .describe("Due date as ISO 8601 timestamp"),
  description: z.string().optional(),
  tags: z
    .array(z.string())
    .optional()
    .describe("Tag UIDs (not names)"),
  stage: z
    .enum(["exploring", "in-dev", "in-review", "in-prod", "done"])
    .optional()
    .describe("Workflow stage. Separate from 'done' flag."),
}

export async function addTask(args: {
  title: string
  matrix: "todo" | "schedule" | "delegate" | "delete" | "backlog"
  due_date?: string
  description?: string
  tags?: string[]
  stage?: "exploring" | "in-dev" | "in-review" | "in-prod" | "done"
}) {
  return apiRequest("/tasks", { method: "POST", body: args })
}
