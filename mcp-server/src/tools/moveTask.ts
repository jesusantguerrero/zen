import { z } from "zod"
import { apiRequest } from "../apiClient.js"

export const moveTaskSchema = {
  task_uid: z.string().describe("Task ID"),
  matrix: z
    .enum(["todo", "schedule", "delegate", "delete", "backlog"])
    .describe("Target Eisenhower quadrant"),
}

export async function moveTask(args: {
  task_uid: string
  matrix: "todo" | "schedule" | "delegate" | "delete" | "backlog"
}) {
  return apiRequest(`/tasks/${encodeURIComponent(args.task_uid)}/move`, {
    method: "PATCH",
    body: { matrix: args.matrix },
  })
}
