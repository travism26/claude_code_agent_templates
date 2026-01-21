# Search Logs Command

Search and analyze structured JSON logs from the centralized logging system.

## Usage

```bash
/search_logs [OPTIONS]
```

## Options

- `--correlation-id <id>` - Find all logs with a specific correlation ID (trace full request journey)
- `--service <service>` - Filter by service (api, worker, ai, queue, frontend)
- `--level <level>` - Filter by log level (error, warn, info, debug)
- `--since <time>` - Show logs since a time (e.g., "5m", "1h", "2025-01-15")
- `--pattern <regex>` - Search for pattern in log messages
- `--limit <n>` - Limit number of results (default: 50)

## Examples

### Trace a request by correlation ID
```bash
/search_logs --correlation-id abc123-def456
```

### Find recent errors
```bash
/search_logs --level error --since 1h
```

### Search worker logs for a specific garden
```bash
/search_logs --service worker --pattern "gardenId.*123"
```

### Find all AI provider calls in the last hour
```bash
/search_logs --service ai --since 1h --pattern "AI provider call"
```

### Trace a failed job
```bash
/search_logs --correlation-id <id> --level error
```

## Implementation

This command searches JSON logs in `backend/logs/` directory. Use `jq` for parsing JSON logs and `grep` for pattern matching.

### Basic correlation ID search
```bash
cd backend/logs
grep -h "abc123-def456" *.log | jq -r '. | "\(.timestamp) [\(.level)] [\(.service)] \(.message) | \(.correlationId)"' | sort
```

### Service-specific search
```bash
cd backend/logs
cat worker-*.log | jq -r 'select(.level == "error") | "\(.timestamp) \(.message)"' | tail -20
```

### Time-based search (files modified in last hour)
```bash
cd backend/logs
find . -name "*.log" -mmin -60 -exec cat {} \; | jq -r 'select(.level == "error")'
```

### Pattern search across all logs
```bash
cd backend/logs
grep -h "pattern" *.log | jq -r '. | "\(.timestamp) [\(.service)] \(.message)"'
```

## Tips

- Always use correlation IDs to trace full request journeys from API → Queue → Worker → AI
- Use `--level error` to quickly find failures
- Combine `--service` and `--pattern` for targeted searches
- Recent logs are in files with today's date suffix (e.g., `api-2025-01-15.log`)
- Use `jq` to pretty-print specific fields from JSON logs

## Output Format

The command outputs logs in a readable format:
```
2025-01-15 10:30:45 [info] [api] Incoming request | abc123
2025-01-15 10:30:46 [info] [queue] Enqueueing garden_analysis job | abc123
2025-01-15 10:30:47 [info] [worker] Starting job | abc123
2025-01-15 10:30:52 [info] [ai] AI provider call completed | abc123
2025-01-15 10:30:53 [info] [worker] Job processed successfully | abc123
```
