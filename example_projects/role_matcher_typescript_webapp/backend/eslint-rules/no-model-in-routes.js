/**
 * Custom ESLint rule: no-model-in-routes
 *
 * Prevents routes from importing models directly.
 * Routes should only import from services to maintain architectural boundaries.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent routes from importing models directly',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noModelImport: 'Routes should not import models directly. Use services instead. Import "{{serviceName}}" from "../services/{{serviceName}}" instead.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();

    // Only apply this rule to files in the routes directory
    if (!filename.includes('/routes/') && !filename.includes('\\routes\\')) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;

        // Check if importing from models directory
        if (importSource.includes('../models/') || importSource.includes('..\\models\\')) {
          // Extract model name from import path
          const modelName = importSource.split('/').pop();

          // Suggest the service alternative
          const serviceName = getServiceNameFromModel(modelName);

          context.report({
            node,
            messageId: 'noModelImport',
            data: {
              serviceName,
            },
          });
        }
      },
    };
  },
};

/**
 * Map model names to their corresponding service names
 */
function getServiceNameFromModel(modelName) {
  const modelToServiceMap = {
    'Task': 'taskService',
    'AuditLog': 'auditService',
  };

  return modelToServiceMap[modelName] || 'appropriate service';
}
