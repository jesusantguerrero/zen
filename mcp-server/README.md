# Zen MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets any MCP-compatible AI agent (Claude Desktop, Cursor, etc.) drive Zen — add tasks, move Eisenhower quadrants, start pomodoros, read standup and metrics.

## Architecture (v0.2)

This server is a **client of Zen's HTTP API**. It does not talk to Firestore directly. Every action flows through `https://us-central1-<project>.cloudfunctions.net/api` with the user's API token, so:

- **All business logic (recurrence, stage transitions, validation) lives in Zen** — the MCP can never drift.
- **No Firebase Admin SDK** — no shared service account, no bypass of Firestore security rules.
- **Per-user authentication** — each user has their own API token obtained via Zen's OAuth flow. Multi-user and hosted scenarios work naturally.

## Tools

| Tool | API endpoint |
|---|---|
| `add_task` | `POST /tasks` |
| `move_task` | `PATCH /tasks/:id/move` |
| `complete_task` | `PATCH /tasks/:id/complete` |
| `start_timer` | `POST /tracks/start-timer` |
| `get_standup` | `GET /standup?date=yyyy-MM-dd` |
| `get_metrics` | `GET /metrics?from=yyyy-MM-dd&to=yyyy-MM-dd` |

## Setup

1. **Install + build**:
   ```sh
   cd mcp-server
   npm install
   npm run build
   ```

2. **Get an API token** — in the Zen app, go to **Settings → API Tokens → Generate token**. Give it a label (e.g. "Claude Desktop"), copy the token that appears **once** — you will not be able to see it again.

3. **Environment variables** (set in your MCP client config):
   ```
   ZEN_API_BASE=https://us-central1-appzen-367e1.cloudfunctions.net/api
   ZEN_API_TOKEN=<your-api-token>
   ```

## Hooking it up to Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "zen": {
      "command": "node",
      "args": ["/absolute/path/to/zen/mcp-server/dist/index.js"],
      "env": {
        "ZEN_API_BASE": "https://us-central1-appzen-367e1.cloudfunctions.net/api",
        "ZEN_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

Restart Claude Desktop, then try:
- *"Add a task 'Review PR #42' to my todo quadrant"*
- *"What did I complete yesterday?"*
- *"Start a pomodoro on task XYZ"*
- *"Give me my focus metrics for this week"*

## Dev

```sh
npm run dev   # tsx watch mode
```

Health check:
```sh
curl https://us-central1-appzen-367e1.cloudfunctions.net/api/health
```

## Security notes

- Your API token is equivalent to your user account. Don't share it. If compromised, delete the corresponding `connections` document in Firestore to revoke.
- The MCP stdio transport has no auth layer of its own — **don't expose this server over a network**. Run it as a local child process of your MCP client.

## Known limitations

- **Tags use UIDs, not names.** Tools accept arrays of tag UIDs. A `list_tags` tool is on the roadmap.
- **No real-time sync with the web app's timer UI.** If the MCP starts a pomodoro, the web app may need a page reload to reflect it.
- **OAuth UI for generating API tokens is not yet built.** See bootstrap note in setup. Proper OAuth flow is the next cycle item.

## Migration notes

If you set up v0.1 with `ZEN_SERVICE_ACCOUNT_PATH` and `ZEN_USER_UID`, those env vars are no longer used — swap them for `ZEN_API_BASE` and `ZEN_API_TOKEN`. You can delete any `service-account.json` you downloaded.
