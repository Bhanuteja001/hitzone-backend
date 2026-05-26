import express from "express";
import {
  createStore,
  getAllStores,
  getStore,
  updateStore,
  deleteStore,
} from "../controllers/StoreController.js";
import {
  createTransaction,
  getStoreTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/StoreTransactionController.js";
import { authenticate, authorize } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllStores);
router.get("/:id", getStore);

router.use(authenticate);

// Store write routes
router.post("/", authorize("admin"), createStore);
router.patch("/:id", authorize("admin"), updateStore);
router.delete("/:id", authorize("admin"), deleteStore);

// Transaction routes
router.post("/transactions/create", authorize("admin", "user"), createTransaction);
router.get("/:storeId/transactions", getStoreTransactions);
router.get("/transactions/:id", getTransaction);
router.patch("/transactions/:id", authorize("admin"), updateTransaction);
router.delete("/transactions/:id", authorize("admin"), deleteTransaction);

export default router;
