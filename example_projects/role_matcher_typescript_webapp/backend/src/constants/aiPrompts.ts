/**
 * AI Prompts Constants
 *
 * This file contains all AI prompt templates used throughout the application.
 * Centralizing prompts makes them easier to maintain, test, and version.
 */

import { Task } from '../types';

/**
 * Builds the task prioritization prompt for the AI service.
 *
 * This template is used to generate intelligent re-prioritization recommendations
 * based on task attributes like deadlines, importance, effort, and dependencies.
 *
 * @param tasks - Array of tasks to analyze
 * @returns The formatted prompt string ready for AI processing
 */
export function buildTaskPrioritizationPrompt(tasks: Task[]): string {
  const taskList = tasks.map((task, index) =>
    `${index + 1}. [ID: ${task.id}] ${task.title}
   Description: ${task.description}
   Status: ${task.status}
   Due: ${task.dueDate || 'No due date'}
   Effort: ${task.effort}/5
   Importance: ${task.importance}/5
   Category: ${task.category}
   Current Priority Score: ${task.priority}`
  ).join('\n\n');

  return TASK_PRIORITIZATION_PROMPT_TEMPLATE.replace('{{TASK_LIST}}', taskList);
}

/**
 * Task Prioritization Prompt Template
 *
 * This template defines how the AI should analyze and prioritize tasks.
 * The {{TASK_LIST}} placeholder will be replaced with actual task data.
 *
 * Expected Response Format:
 * {
 *   rerankedTasks: Array<{ taskId: number, newPriority: number, justification: string }>,
 *   missingSuggestions: string[],
 *   identifiedRisks: string[]
 * }
 */
export const TASK_PRIORITIZATION_PROMPT_TEMPLATE = `You are a task prioritization assistant. Analyze the following task list and provide intelligent re-prioritization recommendations.

TASKS:
{{TASK_LIST}}

Please provide your analysis in the following JSON format:
{
  "rerankedTasks": [
    {
      "taskId": <task_id>,
      "newPriority": <suggested_priority_score>,
      "justification": "<brief explanation>"
    }
  ],
  "missingSuggestions": [
    "<suggestion_1>",
    "<suggestion_2>"
  ],
  "identifiedRisks": [
    "<risk_1>",
    "<risk_2>"
  ]
}

Guidelines:
- Suggest new priority scores that consider deadlines, importance, effort, and dependencies
- Identify any tasks that seem urgent or at risk of being overlooked
- Suggest any missing tasks based on the current task list
- Identify potential risks (e.g., overdue tasks, conflicting deadlines, unrealistic workload)
- Keep justifications concise (1-2 sentences)
- Only include tasks where you recommend a priority change

Return ONLY valid JSON, no additional text.`;
