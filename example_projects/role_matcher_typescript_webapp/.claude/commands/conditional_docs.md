# Conditional Documentation Guide

This prompt helps you determine what documentation you should read based on the specific changes you need to make in the codebase. Review the conditions below and read the relevant documentation before proceeding with your task.

## Instructions

- Review the task you've been asked to perform
- Check each documentation path in the Conditional Documentation section
- For each path, evaluate if any of the listed conditions apply to your task
  - IMPORTANT: Only read the documentation if any one of the conditions match your task
- IMPORTANT: You don't want to excessively read documentation. Only read the documentation if it's relevant to your task.

## Conditional Documentation

- README.md

  - Conditions:
    - When operating on anything under app/server
    - When operating on anything under app/client
    - When first understanding the project structure
    - When you want to learn the commands to start or stop the server or client

- app/client/src/style.css

  - Conditions:
    - When you need to make changes to the client's style

- .claude/commands/classify_adw.md

  - Conditions:
    - When adding or removing new `adws/adw_*.py` files

- adws/README.md
  - Conditions:
    - When you're operating in the `adws/` directory

- .claude/ai-services-standards.md
  - Conditions:
    - When creating new AI services in `backend/src/services/ai/`
    - When modifying existing AI services (garden analysis, etc.)
    - When implementing AI-powered features (analysis, recommendations, suggestions)
    - When troubleshooting AI service architecture or patterns
    - IMPORTANT: Required reading before adding any new AI domain

- .claude/api-integration-standards.md
  - Conditions:
    - When implementing new API endpoints in the frontend
    - When creating new API client modules in frontend/api/
    - When creating new React Query hooks in frontend/hooks/
    - When defining new types for API requests/responses
    - When you need to understand the frontend API architecture
    - When migrating legacy API code to use the centralized ApiClient
    - When troubleshooting API integration issues
    - When adding new backend endpoints that need frontend integration
    - When reviewing or refactoring existing API code
    - IMPORTANT: This should be read for ANY new API-related work in the frontend

- app_docs/feature-refactor-bullmq-architecture.md
  - Conditions:
    - When working with the BullMQ queue system
    - When implementing background job processing
    - When adding new queue types or workers
    - When troubleshooting Redis connection issues or job processing
    - When working with the worker process (src/worker.ts)
    - When implementing async job enqueueing in routes or services
    - When understanding the two-process architecture (API server + worker)
    - When migrating from old BullMQService class to singleton pattern
    - When working with garden analysis queue or AI task processing
    - When implementing event-driven architectures with message bus
    - When troubleshooting job failures, retries, or connection leaks
    - IMPORTANT: Required reading before modifying any queue-related code

- app_docs/feature-planner-status-tracking.md
  - Conditions:
    - When working with the Plot model or plot status field
    - When implementing features that need to understand plot lifecycle state
    - When modifying AI garden analysis services (GardenContextBuilder, GardenPromptBuilder)
    - When creating features that differentiate between planned vs planted plots
    - When implementing status-aware suggestions or recommendations
    - When writing tests for plot status validation or AI status context
    - When troubleshooting AI service context building or prompt generation
    - When understanding plot status metrics (plannedPlots, plantedPlots, harvestedPlots)
    - When implementing frontend UI for plot status display or editing
    - When working with garden analysis prompts or AI instruction templates

- app_docs/chore-refactor-garden-prompt-builder-srp.md
  - Conditions:
    - When modifying GardenPromptBuilder or garden AI prompt generation
    - When adding new plot lifecycle status types (beyond planned/planted/harvested/archived)
    - When working with prompt constants in backend/src/services/ai/garden/prompts/
    - When implementing status-specific AI guidance or prompt strategies
    - When refactoring AI services to follow Single Responsibility Principle
    - When centralizing or organizing AI prompt templates
    - When understanding the prompt composition architecture (base + status guidance)
    - When troubleshooting prompt content or AI response quality
    - When implementing A/B testing for AI prompts
    - IMPORTANT: Required reading before modifying any garden AI prompt logic

- app_docs/feature-show-suggestions-ui-ai-garden-analysis.md
  - Conditions:
    - When working with the AI suggestions UI components (GardenSuggestionsPanel, SuggestionCard, GardenHealthBadge)
    - When implementing features that display garden analysis or AI recommendations
    - When modifying the garden planner page to add new AI-powered features
    - When working with plot highlighting or visual feedback on the garden canvas
    - When implementing suggestion-related API endpoints or hooks
    - When adding new suggestion types, categories, or priority levels
    - When troubleshooting suggestion display, loading states, or error handling
    - When implementing auto-apply or preview workflows for AI suggestions
    - When understanding the frontend architecture for AI-generated content
    - When creating new features that use the /gardens/:id/analyze endpoint

- app_docs/feature-limit-ai-analysis-daily-limits.md
  - Conditions:
    - When working with AI analysis rate limiting or usage tracking
    - When implementing or modifying daily limit systems or quota management
    - When working with the AnalysisUsage model or analysis_usage table
    - When implementing features that check if users can perform analyses
    - When working with the analysisLimitService or related middleware
    - When adding admin override capabilities for user limits
    - When implementing usage statistics display or limit badges in the UI
    - When working with the /gardens/:id/analyze endpoint limit enforcement
    - When troubleshooting analysis limit errors (403, 409, 429 status codes)
    - When implementing timezone-aware date tracking for user quotas
    - When working with pending analysis state blocking or concurrent request prevention
    - When creating features that need to understand the analysis usage workflow

- app_docs/feature-ai-provider-architecture-refactor.md
  - Conditions:
    - When adding a new AI provider (Google Gemini, Cohere, Mistral, etc.)
    - When modifying AI provider fallback or retry logic
    - When working with AIProviderManager or provider orchestration
    - When implementing provider-specific error handling
    - When configuring AI_DEFAULT_PROVIDER or AI_FALLBACK_PROVIDERS
    - When troubleshooting AI provider failures or availability issues
    - When working with OpenRouter integration or multi-model routing
    - When modifying BaseProvider, AnthropicProvider, OpenAIProvider, or OpenRouterProvider
    - When understanding how BaseAIService.callAI() communicates with AI providers
    - When implementing new domain AI services that extend BaseAIService
    - IMPORTANT: Required reading before adding new AI providers or modifying provider logic

- app_docs/feature-plant-icons-in-garden-plots.md
  - Conditions:
    - When modifying plant icon display logic in GardenCanvas component
    - When adding new plant icons or reorganizing icon assets
    - When working with PlantProfile model's icon_url field or validation
    - When implementing security validation for file paths or asset URLs
    - When troubleshooting icon rendering, sizing, or fallback behavior
    - When working with plot display strategies based on size (small/medium/large)
    - When adding new plant types that require icon categories
    - When implementing icon-related features in the garden planner
    - When understanding the icon path security validation pattern
    - When migrating or updating plant icon assets

- app_docs/feature-centralized-logging-system.md
  - Conditions:
    - When implementing logging in any backend service or API endpoint
    - When working with correlation IDs or distributed tracing
    - When debugging request flows across API → Queue → Worker → AI Provider
    - When adding new services that need structured logging
    - When migrating console.log calls to structured logging
    - When troubleshooting log files or log rotation issues
    - When implementing log searching or analysis features
    - When working with AsyncLocalStorage or request context propagation
    - When adding logging middleware or modifying the middleware chain
    - When integrating with external logging services (Datadog, Loggly, etc.)
    - When working with worker processes or background job logging
    - When implementing frontend logging or log collection endpoints
    - When creating ADW agent features that need to search logs
    - IMPORTANT: Required reading before adding any new logging or modifying existing log calls

- app_docs/chore-migrate-routes-to-centralized-logging.md
  - Conditions:
    - When you need examples of how routes were migrated to centralized logging
    - When understanding the migration pattern from console.log to logApi
    - When reviewing security considerations for logging (credential sanitization, PII protection)
    - When working with API route files that use the logApi logger
    - When troubleshooting metadata structure in route logs
    - When understanding how correlation IDs flow through API routes
    - When verifying all routes have completed logging migration
    - When implementing new routes that need to follow the standard logging pattern

- app_docs/chore-00373c80-migrate-services-middleware-logging.md
  - Conditions:
    - When implementing logging in service layer files (backend/src/services/)
    - When working with middleware logging (backend/src/middleware/)
    - When migrating console.log calls to structured logging in services
    - When adding observability to success paths, performance metrics, or business events
    - When implementing AI service logging (logAI) for providers, domains, or prompts
    - When working with WebSocket service logging (connection lifecycle, message routing)
    - When implementing event bus or message bus logging
    - When adding logging to analysis limit service, notification service, or weather service
    - When understanding the migration pattern for services (vs routes)
    - When troubleshooting service-level logs or correlation ID flow through services
    - When implementing new services that need comprehensive logging coverage
    - When reviewing log level guidelines (debug, info, warn, error) for services

- app_docs/bug-ai-worker-missing-completion-notification.md
  - Conditions:
    - When working with AI task completion notifications
    - When implementing or troubleshooting message bus event handlers in WebSocketService
    - When adding new AI task types that need completion notifications
    - When debugging why users aren't receiving AI task completion notifications
    - When implementing task-type-specific notification messages or links
    - When working with AI_TASK_COMPLETED events or handleAITaskCompleted method
    - When understanding the notification flow from AI worker to user delivery
    - When troubleshooting notification content generation for different task types

- app_docs/feature-26e17808-automated-garden-layout-generator.md
  - Conditions:
    - When implementing automated garden layout generation features
    - When working with the layout AI service (backend/src/services/ai/layout/)
    - When modifying the layout generation API endpoint (/api/gardens/:id/generate-layout)
    - When working with layout generation queue jobs or worker handlers
    - When implementing companion planting optimization logic
    - When understanding plant spacing, sun zone, or USDA zone integration
    - When troubleshooting layout generation job processing or AI calls
    - When building frontend UI for plant selection, layout preview, or layout editing
    - When implementing Square Foot Gardening mode or grid-based layouts
    - When working with the layout_preferences JSONB field in the Garden model
    - When understanding the workflow for async layout generation with WebSocket notifications
    - IMPORTANT: Required reading before extending or modifying layout generation functionality

- app_docs/feature-26e17808-phase2-layout-generator-frontend-ui.md
  - Conditions:
    - When working with the Layout Generator modal or any of its child components
    - When modifying PlantSelector, LayoutPreview, PlantListPanel, or LayoutOptions components
    - When implementing features that use layout generation API (frontend/api/layoutApi.ts)
    - When working with layout generation React Query hooks (useGenerateLayout, useLayoutGenerationStatus)
    - When modifying layout TypeScript types (frontend/types/layout.ts)
    - When troubleshooting layout generation polling, loading states, or error handling
    - When understanding the 4-step wizard workflow (Plant Selection → Generating → Layout Options → Success)
    - When adding new features to the garden planner page that interact with layout generation
    - When implementing layout editing, sun zone mapping, or Phase 3 features
    - When debugging E2E tests for layout generator workflow
    - When understanding the frontend-to-backend integration for async job processing

- app_docs/feature-753f449e-ai-task-prioritizer-backend.md
  - Conditions:
    - When working with the AI Task Prioritizer backend API (backend/src/)
    - When implementing or modifying task CRUD operations
    - When working with automated priority calculation logic
    - When integrating AI prioritization features with Claude API
    - When implementing analytics endpoints for tasks
    - When working with audit logging for task mutations
    - When understanding the rules-based priority scoring algorithm
    - When troubleshooting priority calculation, deadline weights, or category weights
    - When implementing new task management features or extending the Task model
    - When working with SQLite database schema for tasks or audit logs
    - When setting up the backend infrastructure with Docker or TypeScript configuration
    - When understanding the complete backend API architecture and design patterns

- app_docs/feature-service-layer-architecture.md
  - Conditions:
    - When implementing or modifying service layer classes (TaskService, AnalyticsService, AuditService)
    - When refactoring routes to use services instead of direct model access
    - When adding new service classes or business logic layers
    - When working with dependency injection in services
    - When understanding the three-tier architecture (Routes → Services → Models)
    - When implementing automatic audit logging via service dependencies
    - When troubleshooting ESLint architectural violations (no-model-in-routes rule)
    - When adding new custom ESLint rules for architectural enforcement
    - When migrating from direct model access patterns to service-based patterns
    - When setting up architecture linting scripts or CI enforcement
    - When writing unit tests for service layer with mocked dependencies
    - When understanding service method patterns (error handling, priority calculation, audit logging)
    - IMPORTANT: Required reading before modifying any service classes or route refactoring

- app_docs/feature-6ec77587-frontend-api-client-and-ui.md
  - Conditions:
    - When implementing new frontend features that interact with the backend API
    - When working with the centralized API client architecture (frontend/lib/api/)
    - When creating or modifying React Query hooks for data fetching
    - When building UI components for task management, analytics, or audit logs
    - When troubleshooting frontend-backend integration issues
    - When understanding the Express production server and API proxying
    - When adding new pages or routes to the Next.js application
    - When working with TypeScript types for API requests/responses in the frontend
    - When implementing data fetching patterns with React Query
    - When setting up the frontend development or production environment
    - When understanding the complete frontend architecture and component structure
    - IMPORTANT: Required reading before modifying any frontend API integration or UI components

- app_docs/feature-skill-based-assignment-skill-based-assignment-system.md
  - Conditions:
    - When working with employee management features or the Employee model
    - When implementing skill tracking or skill-based queries
    - When working with assignment creation, recommendations, or matching algorithms
    - When implementing capacity or workload tracking for employees
    - When understanding the skill matching score calculation (0-100 scale)
    - When adding new analytics endpoints for skills, gaps, or utilization
    - When extending the Task model to include skill requirements
    - When troubleshooting assignment status workflows (proposed/accepted/rejected)
    - When working with the SkillMatchingService or recommendation engine
    - When implementing features that require employee-task matching logic
    - When understanding the service layer architecture for employee and assignment domains
    - When working with skill-based audit logging or analytics
    - IMPORTANT: Required reading before modifying any employee, skill, or assignment functionality

- app_docs/feature-ui-update-comprehensive-frontend-implementation.md
  - Conditions:
    - When working with employee management UI components (EmployeeList, EmployeeCard, EmployeeForm, SkillManager)
    - When implementing or modifying assignment workflows in the frontend
    - When working with the RecommendationsPanel or AI-powered assignment features
    - When creating or modifying API client modules for employees, assignments, or extended analytics
    - When implementing React Query hooks for employee, assignment, or analytics data
    - When adding new pages for employee or assignment management
    - When working with skill search, filtering, or display features
    - When implementing capacity/workload visualizations or progress indicators
    - When troubleshooting frontend-backend integration for workforce management features
    - When understanding the complete frontend architecture for the task prioritizer system
    - When working with extended analytics components (skill distribution, utilization, skill gaps)
    - When implementing query invalidation patterns for related data updates
    - When adding new workforce management features to the frontend
    - IMPORTANT: Required reading before modifying any employee or assignment frontend components

- app_docs/issue-fix-validation-errors-and-missing-navigation.md
  - Conditions:
    - When troubleshooting backend validation errors for query parameters (NaN, undefined)
    - When working with query string construction in frontend API modules
    - When implementing or modifying API client code that builds URL query parameters
    - When encountering Zod validation errors about "Expected number, received nan"
    - When seeing "Invalid enum value, received 'undefined'" errors from the backend
    - When adding Layout component to new pages to ensure navigation consistency
    - When pages are missing the navigation bar
    - When creating utility functions for sanitizing query parameters
    - When working with URLSearchParams and need to filter out undefined/null values
    - When implementing API pagination or filtering features
    - When understanding the pattern for wrapping pages with Layout component
    - When troubleshooting frontend-backend integration for filtered lists or search features

- app_docs/feature-multi-provider-ai-support.md
  - Conditions:
    - When adding new AI providers beyond Anthropic, OpenAI, and OpenRouter
    - When working with AI provider abstraction layer (BaseAIProvider, AIProviderFactory)
    - When modifying backend/src/services/ai/ directory or provider implementations
    - When configuring AI_PROVIDER environment variable or provider-specific API keys
    - When implementing provider switching or multi-provider support features
    - When troubleshooting AI provider initialization, API calls, or error handling
    - When working with AICompletionRequest or AICompletionResponse types
    - When understanding the Strategy/Factory pattern for AI provider architecture
    - When implementing provider-specific configuration (models, options, headers)
    - When working with provider singleton pattern or cache management
    - When migrating from direct SDK usage to provider abstraction
    - When writing tests for AI provider functionality
    - IMPORTANT: Required reading before modifying any AI provider code or adding new providers

- app_docs/feature-architectural-validation-stage.md
  - Conditions:
    - When working with the Travis SDLC workflow validation phase
    - When implementing architectural boundary enforcement with ESLint
    - When adding new custom ESLint rules for architectural patterns
    - When working with ValidationViolation data type or validation-related slash commands
    - When troubleshooting validation phase failures or retry logic
    - When implementing service layer pattern enforcement (routes → services → models)
    - When working with .adw/travis/travis_validate.py or validation scripts
    - When understanding the validate phase integration in travis_sdlc.py
    - When adding --skip-validate, --max-validation-retries, or --validate-warnings-only flags
    - When implementing auto-resolution logic for architectural violations
    - When working with backend/scripts/validate-architecture.js or npm validation scripts
    - When understanding how /validate and /resolve_validation_violation commands work
    - IMPORTANT: Required reading before modifying validation phase or adding architectural rules

- app_docs/feature-openrouter-integration.md
  - Conditions:
    - When working with OpenRouter SDK integration or configuration
    - When modifying AI service to use OpenRouter instead of direct provider SDKs
    - When implementing or updating centralized AI prompt management
    - When troubleshooting markdown code block parsing in AI responses
    - When configuring OPENROUTER_API_KEY, OPENROUTER_MODEL, or related environment variables
    - When adding new AI models or switching between different AI providers
    - When working with backend/src/config/openrouter.ts or backend/src/constants/aiPrompts.ts
    - When migrating from Anthropic SDK to OpenRouter
    - When implementing AI response parsing enhancements
    - When understanding the AI prioritization service architecture
    - When working with multi-model AI routing or provider flexibility features

- app_docs/feature-route-logging.md
  - Conditions:
    - When implementing request/response logging in the backend
    - When working with Winston logger configuration or transports
    - When adding or modifying the request logging middleware
    - When troubleshooting log file creation, rotation, or retention issues
    - When implementing structured logging for HTTP requests
    - When extracting client IP addresses or user context from requests
    - When adding response time tracking or performance monitoring
    - When implementing error-level logging based on HTTP status codes
    - When working with backend/src/config/logger.ts or backend/src/middleware/requestLogger.ts
    - When understanding the daily rotating file transport setup
    - When configuring LOG_LEVEL environment variable
    - When analyzing API request logs or debugging traffic patterns
    - When implementing correlation IDs or request tracing
    - IMPORTANT: Required reading before modifying any logging configuration or middleware
