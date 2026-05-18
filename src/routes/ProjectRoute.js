import express from "express";
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/ProjectController.js";
import {
  createTransaction,
  getProjectTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/ProjectTransactionController.js";
import { authenticate, authorize } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(authenticate);

// Project routes
router.get("/", getAllProjects);
router.get("/:id", getProject);
router.post("/", authorize("admin"), createProject);
router.patch("/:id", authorize("admin"), updateProject);
router.delete("/:id", authorize("admin"), deleteProject);

// Transaction routes
router.post("/transactions/create", authorize("admin"), createTransaction);
router.get("/:projectId/transactions", getProjectTransactions);
router.get("/transactions/:id", getTransaction);
router.patch("/transactions/:id", authorize("admin"), updateTransaction);
router.delete("/transactions/:id", authorize("admin"), deleteTransaction);

export default router;
