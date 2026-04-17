#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"

import { addTask, addTaskSchema } from "./tools/addTask.js"
import { moveTask, moveTaskSchema } from "./tools/moveTask.js"
import { completeTask, completeTaskSchema } from "./tools/completeTask.js"
import { startTimer, startTimerSchema } from "./tools/startTimer.js"
import { getStandup, getStandupSchema } from "./tools/getStandup.js"
import { getMetrics, getMetricsSchema } from "./tools/getMetrics.js"

type ToolDef = {
  name: string
  description: string
  schema: Record<string, z.ZodTypeAny>
  handler: (args: any) => Promise<unknown>
}

const TOOLS: ToolDef[] = [
  {
    name: "add_task",
    description: "Create a new task in Zen. Task lives in a matrix quadrant (todo/schedule/delegate/delete/backlog).",
    schema: addTaskSchema,
    handler: addTask,
  },
  {
    name: "move_task",
    description: "Move an existing task to a different Eisenhower matrix quadrant.",
    schema: moveTaskSchema,
    handler: moveTask,
  },
  {
    name: "complete_task",
    description: "Mark a task as done with today's commit date.",
    schema: completeTaskSchema,
    handler: completeTask,
  },
  {
    name: "start_timer",
    description: "Start a pomodoro/tracking session on a task. Automatically stops any currently running track.",
    schema: startTimerSchema,
    handler: startTimer,
  },
  {
    name: "get_standup",
    description: "Return tasks completed on a given day (defaults to yesterday) for standup generation.",
    schema: getStandupSchema,
    handler: getStandup,
  },
  {
    name: "get_metrics",
    description: "Return aggregated metrics (pomodoros, focus time, tasks completed) for a date range.",
    schema: getMetricsSchema,
    handler: getMetrics,
  },
]

const server = new Server(
  {
    name: "zen-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: { tools: {} },
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodShapeToJsonSchema(t.schema),
  })),
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = TOOLS.find((t) => t.name === request.params.name)
  if (!tool) {
    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
    }
  }

  try {
    const parsed = z.object(tool.schema).parse(request.params.arguments ?? {})
    const result = await tool.handler(parsed)
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: err instanceof Error ? err.message : String(err),
        },
      ],
    }
  }
})

function zodShapeToJsonSchema(shape: Record<string, z.ZodTypeAny>) {
  // Minimal translation sufficient for MCP tool schemas.
  const properties: Record<string, unknown> = {}
  const required: string[] = []
  for (const [key, zodType] of Object.entries(shape)) {
    properties[key] = zodToJson(zodType)
    if (!zodType.isOptional()) required.push(key)
  }
  return {
    type: "object",
    properties,
    required,
  }
}

function zodToJson(t: z.ZodTypeAny): Record<string, unknown> {
  const description = (t as any)._def?.description
  if (t instanceof z.ZodString) return withDesc({ type: "string" }, description)
  if (t instanceof z.ZodNumber) return withDesc({ type: "number" }, description)
  if (t instanceof z.ZodBoolean) return withDesc({ type: "boolean" }, description)
  if (t instanceof z.ZodEnum)
    return withDesc({ type: "string", enum: (t as any)._def.values }, description)
  if (t instanceof z.ZodArray)
    return withDesc({ type: "array", items: zodToJson((t as any)._def.type) }, description)
  if (t instanceof z.ZodOptional) return zodToJson((t as any)._def.innerType)
  if (t instanceof z.ZodDefault) return zodToJson((t as any)._def.innerType)
  return withDesc({}, description)
}

function withDesc(obj: Record<string, unknown>, description?: string) {
  if (description) return { ...obj, description }
  return obj
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // stderr so MCP clients don't see it on stdout
  console.error("Zen MCP server running on stdio")
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
