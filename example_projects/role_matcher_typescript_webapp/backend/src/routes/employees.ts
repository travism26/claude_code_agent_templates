import { Router, Request, Response } from "express";
import { EmployeeService } from "../services/employeeService";
import { validateBody, validateQuery } from "../middleware/validation";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  addSkillSchema,
  updateSkillLevelSchema,
  queryEmployeesSchema,
} from "../validation/employeeSchemas";

const router = Router();
const employeeService = new EmployeeService();

// GET /employees - List all employees with pagination and filtering
router.get(
  "/",
  validateQuery(queryEmployeesSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.query as any;
    const { employees, pagination } = await employeeService.getAllEmployees(
      params
    );

    res.json({
      success: true,
      data: {
        employees,
        pagination,
      },
    });
  })
);

// GET /employees/search/by-skill - Find employees with specific skill/level
router.get(
  "/search/by-skill",
  asyncHandler(async (req: Request, res: Response) => {
    const { skillName, minLevel } = req.query;

    if (!skillName || typeof skillName !== "string") {
      throw new AppError(400, "skillName query parameter is required");
    }

    const minLevelNum = minLevel ? parseInt(minLevel as string) : undefined;
    if (
      minLevel &&
      (isNaN(minLevelNum!) || minLevelNum! < 1 || minLevelNum! > 5)
    ) {
      throw new AppError(400, "minLevel must be between 1 and 5");
    }

    const { EmployeeModel } = await import("../models/Employee");
    const employees = EmployeeModel.findBySkill(skillName, minLevelNum);

    res.json({
      success: true,
      data: employees,
    });
  })
);

// GET /employees/:id - Get a single employee by ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, "Invalid employee ID");
    }

    try {
      const employee = await employeeService.getEmployeeById(id);
      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new AppError(404, "Employee not found");
      }
      throw error;
    }
  })
);

// POST /employees - Create a new employee
router.post(
  "/",
  validateBody(createEmployeeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeeService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      data: employee,
    });
  })
);

// PATCH /employees/:id - Update an existing employee
router.patch(
  "/:id",
  validateBody(updateEmployeeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, "Invalid employee ID");
    }

    try {
      const employee = await employeeService.updateEmployee(id, req.body);
      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new AppError(404, "Employee not found");
      }
      throw error;
    }
  })
);

// DELETE /employees/:id - Delete an employee
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, "Invalid employee ID");
    }

    try {
      await employeeService.deleteEmployee(id);
      res.json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new AppError(404, "Employee not found");
      }
      throw error;
    }
  })
);

// GET /employees/:id/skills - List all skills for an employee
router.get(
  "/:id/skills",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, "Invalid employee ID");
    }

    try {
      const skills = await employeeService.getEmployeeSkills(id);
      res.json({
        success: true,
        data: skills,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new AppError(404, "Employee not found");
      }
      throw error;
    }
  })
);

// POST /employees/:id/skills - Add a skill to an employee
router.post(
  "/:id/skills",
  validateBody(addSkillSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, "Invalid employee ID");
    }

    try {
      const { skillName, level } = req.body;
      const skill = await employeeService.addSkill(id, skillName, level);

      res.status(201).json({
        success: true,
        data: skill,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new AppError(404, "Employee not found");
        }
        if (error.message.includes("already has")) {
          throw new AppError(400, error.message);
        }
      }
      throw error;
    }
  })
);

// PATCH /employees/:id/skills/:skillName - Update skill level
router.patch(
  "/:id/skills/:skillName",
  validateBody(updateSkillLevelSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, "Invalid employee ID");
    }

    const { skillName } = req.params;
    const { level } = req.body;

    try {
      const skill = await employeeService.updateSkillLevel(
        id,
        skillName,
        level
      );
      res.json({
        success: true,
        data: skill,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("does not have")
        ) {
          throw new AppError(404, error.message);
        }
      }
      throw error;
    }
  })
);

// DELETE /employees/:id/skills/:skillName - Remove a skill
router.delete(
  "/:id/skills/:skillName",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(400, "Invalid employee ID");
    }

    const { skillName } = req.params;

    try {
      await employeeService.removeSkill(id, skillName);
      res.json({
        success: true,
        message: "Skill removed successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("does not have")
        ) {
          throw new AppError(404, error.message);
        }
      }
      throw error;
    }
  })
);

export default router;
