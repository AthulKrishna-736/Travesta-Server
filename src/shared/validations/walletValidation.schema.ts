
import { z } from "zod";

export const createWalletSchema = z.object({
    userId: z
        .string({
            error: "User ID is required and must be a string",
        })
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),

    balance: z
        .number({
            error: "Balance must be a number",
        })
        .min(50, "Amount must be at least 50")
        .max(2000, "Amount exceeds allowed limit 2000")
        .optional()
        .default(0),
});

export const updateWalletSchema = z.object({
    balance: z
        .number({
            error: "Balance must be a number",
        })
        .min(50, "Amount must be at least 50")
        .max(2000, "Amount exceeds allowed limit 2000")
        .optional(),
});

export const createPaymentIntentSchema = z.object({
    amount: z
        .number({
            error: "Amount is required and must be a number",
        })
        .int("Amount must be an integer")
        .min(50, "Minimum amount is 50"),

    purpose: z.enum(["wallet", "booking", "subscription"], {
        error: "Purpose is required or invalid",
    }),

    refId: z
        .string({
            error: "Ref Id must be a string",
        })
        .optional(),
}).superRefine((data, ctx) => {
    if (data.purpose === "wallet" && data.amount > 2000) {
        ctx.addIssue({
            path: ["amount"],
            message: "Maximum amount for wallet is 2000",
            code: "custom",
        });
    }

    if (data.purpose === "subscription" && data.amount > 1000) {
        ctx.addIssue({
            path: ["amount"],
            message: "Maximum amount for subscription is 1000",
            code: "custom",
        });
    }

    if (data.purpose === "booking" && data.amount > 500000) {
        ctx.addIssue({
            path: ["amount"],
            message: "Maximum amount for booking is 500000",
            code: "custom",
        });
    }
});
