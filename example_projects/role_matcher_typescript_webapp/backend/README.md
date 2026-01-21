# AI Task Prioritizer Backend

A robust backend API for the AI Task Prioritizer application, combining rules-based priority scoring with LLM-powered intelligent prioritization.

## Features

- **Task Management**: Full CRUD operations with automatic priority calculation
- **AI Enhancement**: OpenRouter integration for intelligent task re-ranking and insights (supports 300+ AI models)
- **Analytics**: Category counts, overdue tasks, effort distribution, and more
- **Audit Logging**: Comprehensive tracking of all data mutations
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Testing**: Comprehensive Jest test suite with >80% coverage
- **Production Ready**: Docker support, error handling, and API documentation

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Validation**: Zod
- **AI**: OpenRouter (unified API for 300+ AI models including Claude, GPT-4, Gemini, and more)
- **Testing**: Jest + Supertest
- **Documentation**: OpenAPI 3.0

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment configuration:

```bash
cp .env.example .env
```

4. Configure your `.env` file:

```env
PORT=3000
DATABASE_PATH=./data/tasks.db
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-3-5-sonnet-20241022
```

**Getting an OpenRouter API Key:**

1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to the API Keys section
4. Generate a new API key
5. Add it to your `.env` file as `OPENROUTER_API_KEY`

### Running the Application

#### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot-reloading enabled.

#### Production Mode

```bash
npm run build
npm start
```

#### Using Docker

```bash
docker build -t task-prioritizer-backend .
docker run -p 3000:3000 \
  -e OPENROUTER_API_KEY=your_key \
  -e OPENROUTER_MODEL=anthropic/claude-3-5-sonnet-20241022 \
  task-prioritizer-backend
```

Or with Docker Compose:

```bash
docker-compose up -d
```

## API Endpoints

### Tasks

- `GET /tasks` - List all tasks (with pagination, filtering, sorting)
- `GET /tasks/:id` - Get a single task
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `POST /tasks/ai-prioritize` - Get AI prioritization recommendations

### Analytics

- `GET /analytics/categories` - Get task count by category
- `GET /analytics/overdue` - Get overdue tasks
- `GET /analytics/today` - Get tasks due today
- `GET /analytics/effort-distribution` - Get task count by effort level
- `GET /analytics/summary` - Get overall statistics

### Audit Logs

- `GET /audit` - Get all audit logs (with pagination and filtering)
- `GET /audit/:taskId` - Get audit logs for a specific task

### Health Check

- `GET /health` - Service health status

## API Documentation

Full OpenAPI 3.0 specification is available in `openapi.yaml`. You can view it using:

- [Swagger Editor](https://editor.swagger.io/)
- [Redoc](https://redocly.github.io/redoc/)
- Any OpenAPI-compatible tool

## Priority Calculation

Tasks are automatically assigned a priority score using the formula:

```
priority = importance × 2 + effort × (-1) + deadlineWeight + categoryWeight
```

### Deadline Weights

- Overdue: +5
- Due today: +4
- Due tomorrow: +3
- Due within a week: +2
- Due within a month: +1
- Due beyond a month: 0

### Category Weights

- urgent: +3
- work: +2
- health: +2.5
- finance: +2.5
- learning: +1.5
- personal: +1
- household: +1
- other: 0

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dueDate TEXT,
  effort INTEGER CHECK(effort >= 1 AND effort <= 5),
  importance INTEGER CHECK(importance >= 1 AND importance <= 5),
  category TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')),
  priority REAL DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
)
```

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskId INTEGER,
  action TEXT CHECK(action IN ('create', 'update', 'delete')),
  userId TEXT,
  changes TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (taskId) REFERENCES tasks(id)
)
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Test Coverage

The project maintains >80% test coverage across:

- Unit tests for priority calculation logic
- Integration tests for all API endpoints
- Mock tests for AI service integration
- Edge case and error handling tests

## Development

### Type Checking

```bash
npm run type-check
```

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, OpenRouter)
│   ├── constants/       # AI prompts and constants
│   ├── models/          # Data models (Task, AuditLog)
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic (priority, AI)
│   ├── middleware/      # Express middleware
│   ├── validation/      # Zod schemas
│   ├── types/           # TypeScript types
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── openapi.yaml         # API documentation
├── Dockerfile           # Docker image configuration
├── docker-compose.yml   # Docker Compose orchestration
└── README.md           # This file
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment | development | No |
| `DATABASE_PATH` | SQLite database path | ./data/tasks.db | No |
| `OPENROUTER_API_KEY` | OpenRouter API key | - | Yes (for AI features) |
| `OPENROUTER_MODEL` | AI model to use | anthropic/claude-3-5-sonnet-20241022 | No |
| `OPENROUTER_SITE_URL` | Your site URL (for rankings) | - | No |
| `OPENROUTER_SITE_NAME` | Your app name (for rankings) | - | No |

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Validation error
- `404` - Resource not found
- `500` - Internal server error

Error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [...]  // For validation errors
}
```

## AI Prioritization

The AI prioritization endpoint sends your task list to OpenRouter for intelligent analysis using your configured AI model. The AI provides:

- **Re-ranked tasks**: Suggested priority adjustments with justifications
- **Missing suggestions**: Tasks you might have overlooked
- **Identified risks**: Potential issues with deadlines or workload

### Supported Models

OpenRouter provides access to 300+ AI models. Some popular options for task prioritization:

- `anthropic/claude-3-5-sonnet-20241022` - Claude 3.5 Sonnet (recommended, default)
- `anthropic/claude-3-opus-20240229` - Claude 3 Opus (highest quality)
- `openai/gpt-4o` - GPT-4 Omni
- `openai/gpt-4-turbo` - GPT-4 Turbo
- `google/gemini-pro` - Google Gemini Pro

Configure your preferred model using the `OPENROUTER_MODEL` environment variable.

Example request:

```bash
curl -X POST http://localhost:3000/tasks/ai-prioritize
```

Example response:

```json
{
  "success": true,
  "data": {
    "rerankedTasks": [
      {
        "taskId": 1,
        "newPriority": 15,
        "justification": "High importance and approaching deadline"
      }
    ],
    "missingSuggestions": [
      "Consider adding a review task before the deadline"
    ],
    "identifiedRisks": [
      "Task 1 may be at risk due to tight deadline"
    ]
  }
}
```

## Audit Logging

All task mutations (create, update, delete) are automatically logged. Audit logs include:

- Task ID
- Action type (create/update/delete)
- Timestamp
- Changes made (before/after snapshots)

Query audit logs:

```bash
# Get all audit logs
curl http://localhost:3000/audit

# Get logs for specific task
curl http://localhost:3000/audit/1

# Filter by action type
curl http://localhost:3000/audit?action=update
```

## Troubleshooting

### Database Connection Issues

If you see database errors, ensure:

1. The `data/` directory exists and is writable
2. The `DATABASE_PATH` in `.env` is correct
3. No other process is locking the database file

### AI Service Errors

If AI prioritization fails:

1. Verify `OPENROUTER_API_KEY` is set correctly in your `.env` file
2. Check your OpenRouter account has sufficient credits at https://openrouter.ai/
3. Ensure the `OPENROUTER_MODEL` is valid and accessible with your API key
4. Review the OpenRouter API rate limits and usage at https://openrouter.ai/docs
5. Check the console logs for specific error messages

### TypeScript Compilation Errors

Run type checking to identify issues:

```bash
npm run type-check
```

### Test Failures

Ensure the database is properly reset between tests. The test suite uses `resetDatabase()` in `beforeEach` hooks.

## Production Deployment

### Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database path
- [ ] Set secure OPENROUTER_API_KEY
- [ ] Configure OPENROUTER_MODEL for your use case
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for your frontend domain
- [ ] Set up logging and monitoring
- [ ] Configure database backups
- [ ] Set resource limits in Docker

### Docker Production Deployment

```bash
# Build image
docker build -t task-prioritizer-backend .

# Run with production settings
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e OPENROUTER_API_KEY=your_key \
  -e OPENROUTER_MODEL=anthropic/claude-3-5-sonnet-20241022 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  task-prioritizer-backend
```

## Contributing

This backend was built following the ADW (Agent Development Workflow) methodology, with specifications in the `specs/` directory and systematic implementation tracking.

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
