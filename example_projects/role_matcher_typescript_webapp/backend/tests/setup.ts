// Global test setup file
// This file is run before all tests to set up common mocks

// Mock the OpenRouter SDK globally for all tests
jest.mock('@openrouter/sdk', () => {
  return {
    OpenRouter: jest.fn().mockImplementation(() => ({
      chat: {
        send: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                rerankedTasks: [],
                missingSuggestions: [],
                identifiedRisks: []
              })
            }
          }]
        })
      }
    }))
  };
});
