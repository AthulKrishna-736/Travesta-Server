import z from "zod";

export const createCouponSchema = z.object({
    name: z.string()
        .min(3, "Coupon name must be at least 3 characters")
        .max(50, "Coupon name must be less than 50 characters"),

    code: z.string()
        .min(3, "Coupon code must be at least 3 characters")
        .max(20, "Coupon code must be less than 20 characters")
        .regex(/^[A-Z0-9-]+$/, "Coupon code can only contain uppercase letters, numbers, and hyphens"),

    type: z.enum(["flat", "percent"], {
        required_error: "Coupon type is required"
    }),

    value: z.number().min(1, "Discount value must be at least 1"),

    minPrice: z.number().min(0, "Minimum price must be 0 or greater"),

    maxPrice: z.number().min(0, "Maximum price must be 0 or greater"),

    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid start date"),

    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid end date"),
});

export const updateCouponSchema = z.object({
    name: z.string()
        .min(3, "Coupon name must be at least 3 characters")
        .max(50, "Coupon name must be less than 50 characters")
        .optional(),

    code: z.string()
        .min(3)
        .max(20)
        .regex(/^[A-Z0-9-]+$/)
        .optional(),

    type: z.enum(["flat", "percent"]).optional(),

    value: z.number().min(1).optional(),

    minPrice: z.number().min(0).optional(),

    maxPrice: z.number().min(0).optional(),

    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date").optional(),

    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date").optional(),

    isBlocked: z.boolean().optional()
});
