import { z } from "zod"
import { apiRequest } from "../apiClient.js"

export const completeTaskSchema = {
  task_uid: z.string().describe("Task ID"),
}

export async function completeTask(args: { task_uid: string }) {
  return apiRequest(`/tasks/${encodeURIComponent(args.task_uid)}/complete`, {
    method: "PATCH",
  })
}
