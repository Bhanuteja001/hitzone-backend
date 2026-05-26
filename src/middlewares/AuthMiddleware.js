import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token;
  console.log("Auth check - Cookie token:", token ? "exists" : "none");
  console.log("Auth headers:", req.headers.authorization);

  // Fallback to Authorization header if cookie not found
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Auth - Using token from Authorization header");
  }

  if (!token) {
    console.log("Auth failed - No token found");
    return next(new AppError("Unauthorized", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth success - Token verified:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error - Token verification failed:", err.message);
    return next(new AppError("Unauthorized", 401));
  }
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    const allowedRoles = roles.map((r) => r.toLowerCase());
    if (!userRole || !allowedRoles.includes(userRole))
      return next(new AppError("Forbidden", 403));
    next();
  };
