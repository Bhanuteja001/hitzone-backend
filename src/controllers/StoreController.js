import StoreModal from "../models/StoreModal.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createStore = asyncHandler(async (req, res, next) => {
  const store = await StoreModal.create(req.body);
  res.status(201).json({ message: "Store created", store });
});

export const getAllStores = asyncHandler(async (req, res) => {
  const stores = await StoreModal.find().sort({ createdAt: -1 });
  res.json(stores);
});

export const getStore = asyncHandler(async (req, res, next) => {
  const store = await StoreModal.findById(req.params.id);
  if (!store) return next(new AppError("Store not found", 404));
  res.json(store);
});

export const updateStore = asyncHandler(async (req, res, next) => {
  const store = await StoreModal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!store) return next(new AppError("Store not found", 404));
  res.json({ message: "Store updated", store });
});

export const deleteStore = asyncHandler(async (req, res, next) => {
  const store = await StoreModal.findByIdAndDelete(req.params.id);
  if (!store) return next(new AppError("Store not found", 404));
  res.json({ message: "Store deleted" });
});
