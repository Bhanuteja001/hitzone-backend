import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new AppError("Unauthorized", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
});

export const authorize =
  (...roles) =>
    (req, res, next) => {
      const userRole = req.user?.role?.toLowerCase();
      const allowedRoles = roles.map(r => r.toLowerCase());
      if (!userRole || !allowedRoles.includes(userRole))
        return next(new AppError("Forbidden", 403));
      next();
    };
