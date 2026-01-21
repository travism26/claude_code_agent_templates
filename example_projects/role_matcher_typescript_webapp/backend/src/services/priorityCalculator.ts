interface PriorityInput {
  importance: number;
  effort: number;
  dueDate: string | null;
  category: string;
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  urgent: 3,
  work: 2,
  personal: 1,
  health: 2.5,
  finance: 2.5,
  learning: 1.5,
  household: 1,
  other: 0
};

export function calculatePriority(input: PriorityInput): number {
  const { importance, effort, dueDate, category } = input;

  // Base calculation: importance * 2 + effort * (-1)
  let priority = importance * 2 + effort * (-1);

  // Add deadline weight
  priority += calculateDeadlineWeight(dueDate);

  // Add category weight
  priority += calculateCategoryWeight(category);

  // Round to 2 decimal places
  return Math.round(priority * 100) / 100;
}

function calculateDeadlineWeight(dueDate: string | null): number {
  if (!dueDate) return 0;

  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // If overdue, high weight
  if (daysUntilDue < 0) return 5;

  // If due today
  if (daysUntilDue === 0) return 4;

  // If due tomorrow
  if (daysUntilDue === 1) return 3;

  // If due within a week
  if (daysUntilDue <= 7) return 2;

  // If due within a month
  if (daysUntilDue <= 30) return 1;

  // If due beyond a month
  return 0;
}

function calculateCategoryWeight(category: string): number {
  const normalizedCategory = category.toLowerCase();
  return CATEGORY_WEIGHTS[normalizedCategory] || CATEGORY_WEIGHTS.other;
}

export function recalculateTaskPriority(task: {
  importance: number;
  effort: number;
  dueDate: string | null;
  category: string;
}): number {
  return calculatePriority({
    importance: task.importance,
    effort: task.effort,
    dueDate: task.dueDate,
    category: task.category
  });
}
