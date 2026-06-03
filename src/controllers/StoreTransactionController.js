import StoreTransactionModal from "../models/StoreTransaction.js";
import StoreModal from "../models/StoreModal.js";
import UserModal from "../models/UserModal.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTransaction = asyncHandler(async (req, res, next) => {
  const store = await StoreModal.findById(req.body.storeId);
  if (!store) return next(new AppError("Store not found", 404));

  const user = await UserModal.findById(req.user.id);
  req.body.addedBy = user ? user.name : "Admin";

  const transaction = await StoreTransactionModal.create(req.body);
  res.status(201).json({ message: "Transaction created", transaction });
});

export const getStoreTransactions = asyncHandler(async (req, res, next) => {
  const store = await StoreModal.findById(req.params.storeId);
  if (!store) return next(new AppError("Store not found", 404));

  const transactions = await StoreTransactionModal.find({
    storeId: req.params.storeId,
  }).sort({ createdAt: -1 });
  res.json(transactions);
});

export const getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await StoreTransactionModal.findById(
    req.params.id,
  ).populate("storeId", "name address");
  if (!transaction) return next(new AppError("Transaction not found", 404));
  res.json(transaction);
});

export const updateTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await StoreTransactionModal.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!transaction) return next(new AppError("Transaction not found", 404));
  res.json({ message: "Transaction updated", transaction });
});

export const deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await StoreTransactionModal.findByIdAndDelete(
    req.params.id,
  );
  if (!transaction) return next(new AppError("Transaction not found", 404));
  res.json({ message: "Transaction deleted" });
});

export const getAllStoreTransactions = asyncHandler(async (req, res) => {
  const transactions = await StoreTransactionModal.find({}).sort({ createdAt: -1 });
  res.json(transactions);
});

