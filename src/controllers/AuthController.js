import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModal from "../models/UserModal.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await UserModal.findOne({ email });
  if (existing) return next(new AppError("Email already exists", 400));

  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModal.create({
    name,
    email,
    password: hashed,
    phone,
    role,
  });

  res.status(201).json({ message: "User created", userId: user._id });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModal.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const match = await bcrypt.compare(password, user.password);
  if (!match) return next(new AppError("Invalid credentials", 401));

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    role: user.role,
    name: user.name,
    token: token,
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await UserModal.findById(req.user.id).select("-password");
  if (!user) return next(new AppError("User not found", 404));
  res.json(user);
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await UserModal.find().sort({ createdAt: -1 });
  res.json(users);
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  if (email) {
    const existing = await UserModal.findOne({
      email,
      _id: { $ne: req.params.id },
    });
    if (existing) return next(new AppError("Email already exists", 400));
  }

  const updateData = { name, email, phone, role };

  if (password && password !== "••••••••" && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await UserModal.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError("User not found", 404));
  res.json({ message: "User updated", user });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  // Optional safety: don't allow an admin to delete themselves
  if (req.user.id === req.params.id) {
    return next(new AppError("You cannot delete your own account", 400));
  }

  const user = await UserModal.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User not found", 404));
  res.json({ message: "User deleted" });
});
