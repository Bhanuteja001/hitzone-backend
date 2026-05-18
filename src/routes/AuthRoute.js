import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/AuthController.js";
import { authenticate, authorize } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Admin only
router.post("/register", authenticate, authorize("ADMIN"), registerUser);

// Public
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);

// Authenticated users
router.get("/me", authenticate, getMe);

export default router;
