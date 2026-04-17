/**
 * Thin wrapper around fetch that calls Zen's HTTP API with the user's token.
 * Replaces the previous firebase-admin DB-direct approach so the MCP server
 * becomes a proper API consumer — all business logic stays in Zen.
 */

const getConfig = () => {
  const baseUrl = process.env.ZEN_API_BASE
  const token = process.env.ZEN_API_TOKEN

  if (!baseUrl) {
    throw new Error(
      "ZEN_API_BASE env var is required. Example: https://us-central1-appzen-367e1.cloudfunctions.net/api"
    )
  }
  if (!token) {
    throw new Error(
      "ZEN_API_TOKEN env var is required. Generate one through Zen's OAuth flow (see README)."
    )
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), token }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE"

interface RequestOptions {
  method?: Method
  body?: unknown
  query?: Record<string, string | number | undefined>
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { baseUrl, token } = getConfig()
  const { method = "GET", body, query } = options

  let url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
  if (query) {
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        qs.append(key, String(value))
      }
    }
    const qsStr = qs.toString()
    if (qsStr) url += `?${qsStr}`
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let detail = ""
    try {
      const errBody = await res.json()
      detail = errBody.error || JSON.stringify(errBody)
    } catch {
      detail = await res.text().catch(() => "")
    }
    throw new Error(
      `Zen API error ${res.status} on ${method} ${path}: ${detail || res.statusText}`
    )
  }

  if (res.status === 204) return null as T
  return (await res.json()) as T
}
