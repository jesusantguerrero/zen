import { z } from "zod"
import { apiRequest } from "../apiClient.js"

export const getMetricsSchema = {
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Inclusive start date, yyyy-MM-dd"),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Inclusive end date, yyyy-MM-dd"),
}

export async function getMetrics(args: { from: string; to: string }) {
  return apiRequest("/metrics", { query: { from: args.from, to: args.to } })
}
