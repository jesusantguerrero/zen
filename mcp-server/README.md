# Zen MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets any MCP-compatible AI agent (Claude Desktop, Cursor, etc.) drive Zen — add tasks, move Eisenhower quadrants, start pomodoros, read standup and metrics.

## Status

**v0.1 — scaffold.** Core tools are wired. Single-user mode (you set the target user via env var). Multi-tenant / OAuth support is a later iteration.

## Tools

| Tool | Purpose |
|---|---|
| `add_task` | Create a task in a matrix quadrant, optional due date, stage, tags |
| `move_task` | Move task between quadrants (todo/schedule/delegate/delete/backlog) |
| `complete_task` | Mark task done with today's commit date |
| `start_timer` | Start a pomodoro track on a task; auto-stops any running track |
| `get_standup` | Tasks completed on a given day (default: yesterday) |
| `get_metrics` | Aggregated metrics (pomodoros, focus time, completions) over a date range |

## Setup

1. **Install**:
   ```sh
   cd mcp-server
   npm install
   npm run build
   ```

2. **Get a Firebase service account key** for the Zen project:
   - Firebase Console → Project Settings → Service accounts → Generate new private key
   - Save the JSON to `service-account.json` (gitignored)

3. **Find your user UID**:
   - Firebase Console → Authentication → Users → copy the UID of your account

4. **Environment variables** (set in your MCP client config):
   ```
   ZEN_FIREBASE_PROJECT_ID=your-project-id
   ZEN_SERVICE_ACCOUNT_PATH=/absolute/path/to/service-account.json
   ZEN_USER_UID=your-firebase-auth-uid
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
        "ZEN_FIREBASE_PROJECT_ID": "your-project-id",
        "ZEN_SERVICE_ACCOUNT_PATH": "/absolute/path/to/service-account.json",
        "ZEN_USER_UID": "your-firebase-auth-uid"
      }
    }
  }
}
```

Restart Claude Desktop. You should now be able to say things like:
- *"Add a task 'Review PR #42' to my todo quadrant"*
- *"What did I complete yesterday?"*
- *"Start a pomodoro on task XYZ"*
- *"Give me my focus metrics for this week"*

## Dev

```sh
npm run dev   # tsx watch mode
```

## Security notes

- The server runs with **Firebase Admin SDK privileges** — it bypasses Firestore rules. Anything it can query, you as a user can see. Keep `service-account.json` out of version control (already in `.gitignore`).
- Single-user mode: all operations scope to `ZEN_USER_UID`. There is no auth layer on the MCP stdio transport itself — **don't expose this server over a network**.
- Future: OAuth device flow so multiple users can share one deployed instance.

## Known limitations

- Tag operations use tag UIDs (not names). An agent would need to list tags first — a future `list_tags` tool will help.
- `start_timer` doesn't yet sync with the Zen app's in-memory timer UI — the track shows up on Metrics and via refresh. Real-time reflection needs a different integration point.
- `get_metrics` is a simpler aggregation than the Zen UI (no per-day bars). Sufficient for AI prompting.
