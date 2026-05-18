import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./lib/db.js";
import { globalErrorHandler } from "./middlewares/error.js";
import { AppError } from "./utils/AppError.js";
import cookieParser from "cookie-parser";
import AuthRoute from "./routes/AuthRoute.js";
import projectRouter from "./routes/ProjectRoute.js";
import storeRouter from "./routes/StoreRoute.js";

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(cookieParser());

// Your routes will go here
// Example: app.use('/api', routes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to hitzone-backend API" });
});

app.use("/auth", AuthRoute);
app.use("/projects", projectRouter);
app.use("/stores", storeRouter);

app.all("*", (req, res, next) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
