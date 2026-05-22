import express from "express";
import { createContact, getAllContacts, getPaginatedContacts, deleteContact } from "../controllers/ContactController.js";
import { authenticate, authorize } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Public route to submit contact forms
router.post("/", createContact);

// Admin-only route to view submitted contact forms
router.get("/", authenticate, authorize("admin"), getAllContacts);
router.get("/paginated", authenticate, authorize("admin"), getPaginatedContacts);
router.delete("/:id", authenticate, authorize("admin"), deleteContact);

export default router;
