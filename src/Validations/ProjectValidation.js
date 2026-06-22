import { z } from "zod";

/// PROJECT VALIDATIONS ///

export const ProjectSchema = z
  .object({
    projectName: z.string().min(1),
    projectRefId: z.string().min(1),
    clientName: z.string().min(1),
    clientMobile: z
      .string()
      .regex(/^\+?[1-9]\d{9,14}$/, "Invalid mobile number"),
    clientEmail: z.string().email("Invalid email address"),
    agreementAmount: z.string().min(1, "Agreement amount is required"),
    quotationAmount: z.string().min(1, "Quotation amount is required"),
    location: z.string().min(1),
    area: z.string().min(1),
    budget: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : val), z.coerce.date().optional()),
    projectDescription: z.string().optional(),
  })
  .refine((data) => !data.endDate || data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const CreateProjectSchema = ProjectSchema;
export const UpdateProjectSchema = ProjectSchema.partial();

/// PROJECT VALIDATIONS ///

/// PROJECT TRANSACTIONS ///

export const ProjectTransactionSchema = z.object({
  projectId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId"),
  type: z.enum(["CREDIT", "DEBIT"]),
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number(),
});

export const CreateProjectTransactionSchema = ProjectTransactionSchema;
export const UpdateProjectTransactionSchema =
  ProjectTransactionSchema.partial();

/// PROJECT TRANSACTIONS ///
