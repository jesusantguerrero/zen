import { z } from "zod"
import { apiRequest } from "../apiClient.js"

export const getStandupSchema = {
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Date in yyyy-MM-dd format. Defaults to yesterday."),
}

export async function getStandup(args: { date?: string }) {
  return apiRequest("/standup", { query: { date: args.date } })
}
