import ProjectTransactionModal from "../models/ProjectTransaction.js";
import ProjectModal from "../models/ProjectModal.js";
import UserModal from "../models/UserModal.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTransaction = asyncHandler(async (req, res, next) => {
  const project = await ProjectModal.findById(req.body.projectId);
  if (!project) return next(new AppError("Project not found", 404));

  const user = await UserModal.findById(req.user.id);
  req.body.addedBy = user ? user.name : "Admin";

  const transaction = await ProjectTransactionModal.create(req.body);
  res.status(201).json({ message: "Transaction created", transaction });
});

export const getProjectTransactions = asyncHandler(async (req, res, next) => {
  const project = await ProjectModal.findById(req.params.projectId);
  if (!project) return next(new AppError("Project not found", 404));

  const transactions = await ProjectTransactionModal.find({
    projectId: req.params.projectId,
  }).sort({ createdAt: -1 });
  res.json(transactions);
});

export const getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await ProjectTransactionModal.findById(
    req.params.id,
  ).populate("projectId", "projectName projectRefId");
  if (!transaction) return next(new AppError("Transaction not found", 404));
  res.json(transaction);
});

export const updateTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await ProjectTransactionModal.findById(req.params.id);
  if (!transaction) return next(new AppError("Transaction not found", 404));

  const user = await UserModal.findById(req.user.id);
  const currentUserName = user ? user.name : "Admin";
  const txnAddedBy = transaction.addedBy || "Default Admin";

  if (currentUserName.trim().toLowerCase() !== txnAddedBy.trim().toLowerCase()) {
    return next(new AppError("You do not have permission to edit this transaction", 403));
  }

  // Prevent modifying the creator
  delete req.body.addedBy;

  const updatedTransaction = await ProjectTransactionModal.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  res.json({ message: "Transaction updated", transaction: updatedTransaction });
});

export const deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await ProjectTransactionModal.findById(req.params.id);
  if (!transaction) return next(new AppError("Transaction not found", 404));

  const user = await UserModal.findById(req.user.id);
  const currentUserName = user ? user.name : "Admin";
  const txnAddedBy = transaction.addedBy || "Default Admin";

  if (currentUserName.trim().toLowerCase() !== txnAddedBy.trim().toLowerCase()) {
    return next(new AppError("You do not have permission to delete this transaction", 403));
  }

  await ProjectTransactionModal.findByIdAndDelete(req.params.id);
  res.json({ message: "Transaction deleted" });
});

export const getAllProjectTransactions = asyncHandler(async (req, res) => {
  const transactions = await ProjectTransactionModal.find({}).sort({ createdAt: -1 });
  res.json(transactions);
});

