import { z } from "zod";

// Store
export const StoreSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

export const CreateStoreSchema = StoreSchema;
export const UpdateStoreSchema = StoreSchema.partial();

// StoreTransaction
export const StoreTransactionSchema = z.object({
  storeId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId"),
  type: z.enum(["CREDIT", "DEBIT"]),
  title: z.string().optional(),
  description: z.string().optional(),
  amount: z.number(),
});

export const CreateStoreTransactionSchema = StoreTransactionSchema;
export const UpdateStoreTransactionSchema = StoreTransactionSchema.partial();
