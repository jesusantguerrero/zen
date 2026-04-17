import { z } from "zod"
import { apiRequest } from "../apiClient.js"

export const startTimerSchema = {
  task_uid: z.string().describe("Task to track time against"),
  description: z.string().optional().describe("Optional override for the track description"),
}

export async function startTimer(args: { task_uid: string; description?: string }) {
  return apiRequest("/tracks/start-timer", {
    method: "POST",
    body: args,
  })
}
