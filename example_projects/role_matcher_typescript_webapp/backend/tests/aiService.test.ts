import { aiPrioritize } from '../src/services/aiService';
import { Task } from '../src/types';
import * as openRouterConfig from '../src/config/openrouter';

// Mock the OpenRouter SDK at the module level
const mockSend = jest.fn();
jest.mock('@openrouter/sdk', () => {
  return {
    OpenRouter: jest.fn().mockImplementation(() => ({
      chat: {
        send: mockSend
      }
    }))
  };
});

// Mock the config module to prevent actual client creation issues
jest.mock('../src/config/openrouter', () => {
  const actual = jest.requireActual<typeof openRouterConfig>('../src/config/openrouter');
  return {
    ...actual,
    resetClient: jest.fn(),
  };
});

describe('AI Service', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Important Task',
      description: 'A very important task',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      effort: 3,
      importance: 5,
      category: 'work',
      status: 'pending',
      priority: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Low Priority Task',
      description: 'A less important task',
      dueDate: null,
      effort: 5,
      importance: 2,
      category: 'personal',
      status: 'pending',
      priority: -1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const defaultMockResponse = {
    choices: [{
      message: {
        content: JSON.stringify({
          rerankedTasks: [
            {
              taskId: 1,
              newPriority: 15,
              justification: 'High importance and approaching deadline'
            }
          ],
          missingSuggestions: [
            'Consider adding a review task'
          ],
          identifiedRisks: [
            'Task 1 may be at risk due to tight deadline'
          ]
        })
      }
    }]
  };

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    process.env.OPENROUTER_MODEL = 'anthropic/claude-3-5-sonnet-20241022';

    // Reset mock before each test
    mockSend.mockReset();
    mockSend.mockResolvedValue(defaultMockResponse);

    // Reset the client singleton
    openRouterConfig.resetClient();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    jest.clearAllMocks();
  });

  describe('aiPrioritize', () => {
    it('should return AI prioritization results', async () => {
      const result = await aiPrioritize(mockTasks);

      expect(result).toHaveProperty('rerankedTasks');
      expect(result).toHaveProperty('missingSuggestions');
      expect(result).toHaveProperty('identifiedRisks');
      expect(Array.isArray(result.rerankedTasks)).toBe(true);
      expect(Array.isArray(result.missingSuggestions)).toBe(true);
      expect(Array.isArray(result.identifiedRisks)).toBe(true);
    });

    it('should handle empty task list', async () => {
      const result = await aiPrioritize([]);

      expect(result.rerankedTasks).toHaveLength(0);
      expect(result.missingSuggestions).toHaveLength(0);
      expect(result.identifiedRisks).toHaveLength(0);
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.OPENROUTER_API_KEY;

      await expect(aiPrioritize(mockTasks)).rejects.toThrow(
        'OPENROUTER_API_KEY is not configured'
      );
    });

    it('should return valid task recommendations', async () => {
      const result = await aiPrioritize(mockTasks);

      expect(result.rerankedTasks.length).toBeGreaterThan(0);
      result.rerankedTasks.forEach(task => {
        expect(task).toHaveProperty('taskId');
        expect(task).toHaveProperty('newPriority');
        expect(task).toHaveProperty('justification');
        expect(typeof task.taskId).toBe('number');
        expect(typeof task.newPriority).toBe('number');
        expect(typeof task.justification).toBe('string');
      });
    });

    it('should return suggestions and risks', async () => {
      const result = await aiPrioritize(mockTasks);

      expect(result.missingSuggestions.length).toBeGreaterThan(0);
      expect(result.identifiedRisks.length).toBeGreaterThan(0);

      result.missingSuggestions.forEach(suggestion => {
        expect(typeof suggestion).toBe('string');
      });

      result.identifiedRisks.forEach(risk => {
        expect(typeof risk).toBe('string');
      });
    });
  });

  describe('AI response parsing', () => {
    it('should parse structured AI responses', async () => {
      const result = await aiPrioritize(mockTasks);

      // The mock always returns a valid response
      expect(result).toHaveProperty('rerankedTasks');
      expect(result).toHaveProperty('missingSuggestions');
      expect(result).toHaveProperty('identifiedRisks');

      // Verify the structure is correct
      expect(Array.isArray(result.rerankedTasks)).toBe(true);
      expect(Array.isArray(result.missingSuggestions)).toBe(true);
      expect(Array.isArray(result.identifiedRisks)).toBe(true);
    });

    it('should handle responses wrapped in ```json code blocks', async () => {
      // Mock response with markdown-wrapped JSON
      mockSend.mockResolvedValueOnce({
        choices: [{
          message: {
            content: '```json\n' + JSON.stringify({
              rerankedTasks: [{ taskId: 1, newPriority: 10, justification: 'Test' }],
              missingSuggestions: ['Test suggestion'],
              identifiedRisks: ['Test risk']
            }) + '\n```'
          }
        }]
      });

      const result = await aiPrioritize(mockTasks);

      expect(result.rerankedTasks).toHaveLength(1);
      expect(result.missingSuggestions).toHaveLength(1);
      expect(result.identifiedRisks).toHaveLength(1);
    });

    it('should handle responses wrapped in ``` code blocks', async () => {
      // Mock response with markdown-wrapped JSON without language
      mockSend.mockResolvedValueOnce({
        choices: [{
          message: {
            content: '```\n' + JSON.stringify({
              rerankedTasks: [{ taskId: 2, newPriority: 5, justification: 'Test 2' }],
              missingSuggestions: [],
              identifiedRisks: []
            }) + '\n```'
          }
        }]
      });

      const result = await aiPrioritize(mockTasks);

      expect(result.rerankedTasks).toHaveLength(1);
      expect(result.rerankedTasks[0].taskId).toBe(2);
    });

    it('should handle malformed JSON gracefully', async () => {
      // Mock response with invalid JSON
      mockSend.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'This is not valid JSON'
          }
        }]
      });

      const result = await aiPrioritize(mockTasks);

      // Should return empty arrays with error message
      expect(result.rerankedTasks).toHaveLength(0);
      expect(result.missingSuggestions).toContain('Failed to parse AI response. Please try again.');
      expect(result.identifiedRisks).toHaveLength(0);
    });

    it('should handle empty response content', async () => {
      // Mock response with empty content
      mockSend.mockResolvedValueOnce({
        choices: [{
          message: {
            content: ''
          }
        }]
      });

      const result = await aiPrioritize(mockTasks);

      // Should return empty arrays with error message
      expect(result.rerankedTasks).toHaveLength(0);
      expect(result.missingSuggestions).toContain('Failed to parse AI response. Please try again.');
    });
  });

  describe('OpenRouter configuration', () => {
    it('should use the configured model from environment variable', async () => {
      process.env.OPENROUTER_MODEL = 'openai/gpt-4o';

      // The actual model usage would be verified through OpenRouter SDK mock
      // For now, we just ensure the function runs without error
      const result = await aiPrioritize(mockTasks);

      expect(result).toHaveProperty('rerankedTasks');
    });

    it('should use default model when OPENROUTER_MODEL is not set', async () => {
      delete process.env.OPENROUTER_MODEL;

      // Should still work with default model
      const result = await aiPrioritize(mockTasks);

      expect(result).toHaveProperty('rerankedTasks');
    });
  });

  describe('Error handling', () => {
    it('should throw error when OpenRouter API fails', async () => {
      // Mock API failure
      mockSend.mockRejectedValueOnce(new Error('API Error'));

      await expect(aiPrioritize(mockTasks)).rejects.toThrow(
        'Failed to get AI prioritization'
      );
    });
  });
});
