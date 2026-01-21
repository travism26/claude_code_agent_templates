# AI Task Prioritizer - Frontend

A simple, functional frontend application for the AI Task Prioritizer backend. Built with Next.js, React Query, and a centralized API client architecture.

## Features

- **Task Management**: Create, read, update, and delete tasks
- **Analytics Dashboard**: View task statistics and insights
- **AI Prioritization**: Trigger AI-powered task prioritization
- **Audit Logs**: Track changes and history of tasks
- **Responsive Design**: Clean, simple interface for desktop and mobile
- **Type-Safe**: Full TypeScript support with shared types
- **Efficient Data Fetching**: React Query for caching and automatic refetching

## Tech Stack

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **React Query (TanStack Query)**: Data fetching and state management
- **Axios**: HTTP client
- **Express**: Production server for static file serving and API proxying

## Prerequisites

- Node.js 18+ and npm
- Backend server running on port 3000 (default)

## Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=8080
```

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3000)
- `PORT`: Express server port for production mode (default: 8080)

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:3001

Make sure the backend server is running on port 3000 before starting the frontend.

## Production Build

### Option 1: Next.js Server (Standard)

```bash
npm run build
npm start
```

### Option 2: Static Export with Express Server (Recommended for Demos)

```bash
npm run build:static
npm run serve
```

This builds a static export and serves it with Express on port 8080. The Express server also proxies API requests to the backend.

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with React Query provider
│   ├── page.tsx             # Home/dashboard page
│   ├── globals.css          # Global styles
│   ├── tasks/
│   │   └── page.tsx         # Tasks management page
│   ├── analytics/
│   │   └── page.tsx         # Analytics dashboard page
│   └── audit/
│       └── page.tsx         # Audit logs page
├── components/              # React components
│   ├── Layout.tsx           # Main layout wrapper
│   ├── Navigation.tsx       # Navigation menu
│   ├── TaskCard.tsx         # Individual task display
│   ├── TaskForm.tsx         # Task create/edit form
│   ├── TaskList.tsx         # Task list with filters
│   ├── Analytics.tsx        # Analytics dashboard
│   ├── AIPrioritize.tsx     # AI prioritization interface
│   └── AuditLog.tsx         # Audit log viewer
├── hooks/                   # React Query hooks
│   ├── useTasks.ts          # Task-related hooks
│   ├── useAnalytics.ts      # Analytics hooks
│   └── useAudit.ts          # Audit log hooks
├── lib/
│   ├── api/                 # API client layer
│   │   ├── apiClient.ts     # Base Axios client
│   │   ├── tasksApi.ts      # Task API methods
│   │   ├── analyticsApi.ts  # Analytics API methods
│   │   ├── auditApi.ts      # Audit API methods
│   │   └── index.ts         # API exports
│   └── providers/
│       └── QueryProvider.tsx # React Query provider
├── types/                   # TypeScript types
│   ├── task.ts              # Task-related types
│   └── api.ts               # API types
├── server.js                # Express production server
├── .env.local               # Local environment variables
├── .env.example             # Environment variable template
└── package.json             # Dependencies and scripts

```

## API Client Architecture

The frontend uses a centralized API client pattern:

1. **Base Client** (`lib/api/apiClient.ts`): Singleton Axios instance with interceptors
2. **Domain APIs** (`lib/api/*Api.ts`): Domain-specific API methods using the base client
3. **React Query Hooks** (`hooks/*`): Custom hooks for data fetching and mutations

### Example Usage

```typescript
import { useGetTasks, useCreateTask } from '@/hooks/useTasks';

function MyComponent() {
  const { data, isLoading } = useGetTasks();
  const createTask = useCreateTask();

  const handleCreate = async (formData) => {
    await createTask.mutateAsync(formData);
  };

  // ...
}
```

## Available Scripts

- `npm run dev`: Start development server on port 3001
- `npm run build`: Build for production
- `npm run build:static`: Build static export for Express server
- `npm run serve`: Run Express production server on port 8080
- `npm start`: Start Next.js production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

## Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Pages

- **/** - Dashboard with quick stats and links
- **/tasks** - Task management with create/edit/delete and AI prioritization
- **/analytics** - Analytics dashboard with task statistics
- **/audit** - Audit log viewer with filtering and pagination

## Components

All components use `data-testid` attributes for easy testing and include:

- Loading states during API calls
- Error handling with user-friendly messages
- Responsive design with inline styles
- Type-safe props and state

## Future Enhancements

- Add authentication and user management
- Implement drag-and-drop task reordering
- Add rich text editor for task descriptions
- Real-time updates with WebSockets
- Advanced filtering and search
- Data visualization library (Recharts) for better charts
- Task templates and bulk operations

## Troubleshooting

### Backend Connection Issues

If you see connection errors:
1. Ensure the backend is running on port 3000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS is enabled in the backend

### Build Errors

If you encounter build errors:
1. Delete `.next` directory: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`

### Type Errors

Run type checking to identify issues:
```bash
npm run type-check
```

## License

This is a demo project for the AI Task Prioritizer application.
