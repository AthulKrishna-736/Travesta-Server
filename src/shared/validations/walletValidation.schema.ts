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

export const createPaymentIntentSchema = z.object({
    amount: z
        .number({
            required_error: "Amount is required",
            invalid_type_error: "Amount must be a number",
        })
        .int("Amount must be an integer")
        .min(50, "Minimum amount is 50"),

    purpose: z.enum(["wallet", "booking", "subscription"], {
        required_error: "Purpose is required",
        invalid_type_error: 'Invalid Purpose'
    }),

    refId: z
        .string({
            invalid_type_error: "Ref Id must be a string",
        })
        .optional(),
}).superRefine((data, ctx) => {
    if (data.purpose === "wallet") {
        if (data.amount > 2000) {
            ctx.addIssue({
                path: ["amount"],
                message: "Maximum amount for wallet is 2000",
                code: z.ZodIssueCode.custom,
            });
        }
    }

    if (data.purpose === "subscription") {
        if (data.amount > 1000) {
            ctx.addIssue({
                path: ["amount"],
                message: "Maximum amount for subscription is 1000",
                code: z.ZodIssueCode.custom,
            });
        }
    }

    if (data.purpose === "booking") {
        if (data.amount > 500000) {
            ctx.addIssue({
                path: ["amount"],
                message: "Maximum amount for booking is 500000",
                code: z.ZodIssueCode.custom,
            });
        }
    }
});