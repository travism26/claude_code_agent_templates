import { calculatePriority } from '../src/services/priorityCalculator';

describe('Priority Calculator', () => {
  describe('calculatePriority', () => {
    it('should calculate basic priority without due date', () => {
      const priority = calculatePriority({
        importance: 3,
        effort: 2,
        dueDate: null,
        category: 'work'
      });

      // importance*2 + effort*(-1) + categoryWeight
      // 3*2 + 2*(-1) + 2 = 6 - 2 + 2 = 6
      expect(priority).toBe(6);
    });

    it('should add high weight for overdue tasks', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const priority = calculatePriority({
        importance: 3,
        effort: 2,
        dueDate: yesterday.toISOString(),
        category: 'work'
      });

      // 3*2 + 2*(-1) + 5 (overdue) + 2 (work) = 11
      expect(priority).toBe(11);
    });

    it('should add weight for tasks due today', () => {
      const today = new Date();

      const priority = calculatePriority({
        importance: 3,
        effort: 2,
        dueDate: today.toISOString(),
        category: 'work'
      });

      // 3*2 + 2*(-1) + 4 (today) + 2 (work) = 10
      expect(priority).toBe(10);
    });

    it('should add weight for tasks due tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const priority = calculatePriority({
        importance: 3,
        effort: 2,
        dueDate: tomorrow.toISOString(),
        category: 'work'
      });

      // 3*2 + 2*(-1) + 3 (tomorrow) + 2 (work) = 9
      expect(priority).toBe(9);
    });

    it('should handle urgent category correctly', () => {
      const priority = calculatePriority({
        importance: 5,
        effort: 1,
        dueDate: null,
        category: 'urgent'
      });

      // 5*2 + 1*(-1) + 0 + 3 (urgent) = 12
      expect(priority).toBe(12);
    });

    it('should handle low priority tasks', () => {
      const priority = calculatePriority({
        importance: 1,
        effort: 5,
        dueDate: null,
        category: 'other'
      });

      // 1*2 + 5*(-1) + 0 + 0 (other) = -3
      expect(priority).toBe(-3);
    });

    it('should handle tasks with no category weight', () => {
      const priority = calculatePriority({
        importance: 3,
        effort: 3,
        dueDate: null,
        category: 'random-category'
      });

      // 3*2 + 3*(-1) + 0 + 0 (unknown) = 3
      expect(priority).toBe(3);
    });

    it('should handle health category', () => {
      const priority = calculatePriority({
        importance: 4,
        effort: 2,
        dueDate: null,
        category: 'health'
      });

      // 4*2 + 2*(-1) + 0 + 2.5 (health) = 8.5
      expect(priority).toBe(8.5);
    });

    it('should handle case-insensitive categories', () => {
      const priority1 = calculatePriority({
        importance: 3,
        effort: 2,
        dueDate: null,
        category: 'URGENT'
      });

      const priority2 = calculatePriority({
        importance: 3,
        effort: 2,
        dueDate: null,
        category: 'urgent'
      });

      expect(priority1).toBe(priority2);
    });

    it('should reduce weight for tasks due far in the future', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 60);

      const priority = calculatePriority({
        importance: 3,
        effort: 2,
        dueDate: farFuture.toISOString(),
        category: 'work'
      });

      // 3*2 + 2*(-1) + 0 (far future) + 2 (work) = 6
      expect(priority).toBe(6);
    });
  });
});
