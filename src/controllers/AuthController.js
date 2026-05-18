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
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful" });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await UserModal.findById(req.user.id).select("-password");
  if (!user) return next(new AppError("User not found", 404));
  res.json(user);
});
