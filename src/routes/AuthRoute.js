import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/AuthController.js";
import { authenticate, authorize } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Admin only
router.post("/register", authenticate, authorize("admin"), registerUser);
router.get("/users", authenticate, authorize("admin"), getAllUsers);
router.patch("/users/:id", authenticate, authorize("admin"), updateUser);
router.delete("/users/:id", authenticate, authorize("admin"), deleteUser);

// Public
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);

// Authenticated users
router.get("/me", authenticate, getMe);

export default router;
