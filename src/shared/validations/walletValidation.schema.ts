import { z } from "zod";

export const createWalletSchema = z.object({
    userId: z
        .string({
            required_error: "User ID is required",
            invalid_type_error: "User ID must be a string",
        })
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),

    balance: z
        .number({
            invalid_type_error: "Balance must be a number",
        })
        .min(50, "Amount must be at least 50")
        .max(2000, 'Amount exceeds allowed limit 2000')
        .optional()
        .default(0),
});


export const updateWalletSchema = z.object({
    balance: z
        .number({
            invalid_type_error: "Balance must be a number",
        })
        .min(50, "Amount must be at least 50")
        .max(2000, 'Amount exceeds allowed limit 2000')
        .optional(),
});