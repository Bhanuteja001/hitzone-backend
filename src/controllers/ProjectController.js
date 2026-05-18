import ProjectModal from "../models/ProjectModal.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res, next) => {
  const existing = await ProjectModal.findOne({
    projectRefId: req.body.projectRefId,
  });
  if (existing) return next(new AppError("Project ref ID already exists", 400));

  const project = await ProjectModal.create(req.body);
  res.status(201).json({ message: "Project created", project });
});

export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectModal.find().sort({ createdAt: -1 });
  res.json(projects);
});

export const getProject = asyncHandler(async (req, res, next) => {
  const project = await ProjectModal.findById(req.params.id);
  if (!project) return next(new AppError("Project not found", 404));
  res.json(project);
});

export const updateProject = asyncHandler(async (req, res, next) => {
  const project = await ProjectModal.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!project) return next(new AppError("Project not found", 404));
  res.json({ message: "Project updated", project });
});

export const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await ProjectModal.findByIdAndDelete(req.params.id);
  if (!project) return next(new AppError("Project not found", 404));
  res.json({ message: "Project deleted" });
});
