import { Task, AIPrioritizationResponse } from '../types';
import { getOpenRouterClient, getModel } from '../config/openrouter';
import { buildTaskPrioritizationPrompt } from '../constants/aiPrompts';

/**
 * AI Prioritization Service
 *
 * This service uses OpenRouter to access AI models for intelligent task prioritization.
 * It analyzes tasks and provides recommendations for re-prioritization, missing tasks,
 * and potential risks.
 */

export async function aiPrioritize(tasks: Task[]): Promise<AIPrioritizationResponse> {
  // Validate API key is configured
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Handle empty task list
  if (tasks.length === 0) {
    return {
      rerankedTasks: [],
      missingSuggestions: [],
      identifiedRisks: []
    };
  }

  // Get OpenRouter client and build prompt
  const openRouter = getOpenRouterClient();
  const prompt = buildTaskPrioritizationPrompt(tasks);
  const model = getModel();

  try {
    // Call OpenRouter API
    const result = await openRouter.chat.send({
      model: model,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract response text from the result
    // OpenRouter SDK returns a response with choices array
    const content = result.choices?.[0]?.message?.content;
    const responseText = typeof content === 'string' ? content : '';

    return parseAIResponse(responseText);
  } catch (error) {
    console.error('AI prioritization error:', error);
    throw new Error('Failed to get AI prioritization');
  }
}

/**
 * Parses the AI response and extracts prioritization data
 *
 * This function handles various response formats including:
 * - Plain JSON
 * - JSON wrapped in ```json code blocks
 * - JSON wrapped in ``` code blocks
 *
 * @param response - Raw AI response string
 * @returns Parsed prioritization response
 */
function parseAIResponse(response: string): AIPrioritizationResponse {
  try {
    // Extract JSON from potential markdown code blocks
    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    // Handle ```json format
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    // Handle ``` format (no language specified)
    else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Trim whitespace after removing code blocks
    jsonStr = jsonStr.trim();

    const parsed = JSON.parse(jsonStr);

    // Validate and sanitize the response
    const rerankedTasks = (parsed.rerankedTasks || []).map((item: any) => ({
      taskId: Number(item.taskId),
      newPriority: Number(item.newPriority),
      justification: String(item.justification || 'No justification provided')
    }));

    const missingSuggestions = (parsed.missingSuggestions || []).map((s: any) => String(s));
    const identifiedRisks = (parsed.identifiedRisks || []).map((r: any) => String(r));

    return {
      rerankedTasks,
      missingSuggestions,
      identifiedRisks
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Raw response:', response);

    // Return empty response on parse failure
    return {
      rerankedTasks: [],
      missingSuggestions: ['Failed to parse AI response. Please try again.'],
      identifiedRisks: []
    };
  }
}
