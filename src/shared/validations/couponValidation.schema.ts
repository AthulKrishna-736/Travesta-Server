import { z } from "zod";

export const createCouponSchema = z
    .object({
        name: z
            .string({
                required_error: "Name is required",
                invalid_type_error: "Name must be a string",
            })
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(50, "Name must be less than 50 characters"),

        code: z
            .string({
                required_error: "Coupon code is required",
                invalid_type_error: "Coupon code must be a string",
            })
            .trim()
            .min(3, "Coupon code must be at least 3 characters")
            .max(20, "Coupon code must be less than 20 characters")
            .regex(
                /^[A-Z0-9-]+$/,
                "Coupon code can only contain uppercase letters, numbers, and hyphens"
            ),

        type: z.enum(["flat", "percent"], {
            required_error: "Invalid type",
            invalid_type_error: "Invalid type",
        }),

        value: z
            .number({
                required_error: "Value is required",
                invalid_type_error: "Value must be a number",
            })
            .min(1, "Value must be at least 1"),

        count: z
            .number({
                required_error: "Count is required",
                invalid_type_error: "Count must be a number",
            })
            .min(1, "Count must be at least 1"),

        minPrice: z
            .number({
                required_error: "Minimum price required",
                invalid_type_error: "Minimum price must be a number",
            })
            .min(0, "Minimum price must be 0 or greater"),

        maxPrice: z
            .number({
                required_error: "Maximum price required",
                invalid_type_error: "Maximum price must be a number",
            })
            .min(0, "Maximum price must be 0 or greater"),

        startDate: z.string({
            required_error: "Start date required",
            invalid_type_error: "Start date must be a string",
        }),

        endDate: z.string({
            required_error: "End date required",
            invalid_type_error: "End date must be a string",
        }),
    })
    .refine((data) => data.maxPrice >= data.minPrice, {
        message: "Max price must be >= Min price",
        path: ["maxPrice"],
    });


export const updateCouponSchema = z.object({
    name: z
        .string({
            invalid_type_error: "Name must be a string",
        })
        .min(3, "Coupon name must be at least 3 characters")
        .max(50, "Coupon name must be less than 50 characters")
        .optional(),

    code: z
        .string({
            invalid_type_error: "Coupon code must be a string",
        })
        .min(3, "Coupon code must be at least 3 characters")
        .max(20, "Coupon code must be less than 20 characters")
        .regex(
            /^[A-Z0-9-]+$/,
            "Coupon code can only contain uppercase letters, numbers, and hyphens"
        )
        .optional(),

    type: z
        .enum(["flat", "percent"], {
            invalid_type_error: "Invalid coupon type",
        })
        .optional(),

    value: z
        .number({
            invalid_type_error: "Value must be a number",
        })
        .min(1, "Value must be at least 1")
        .optional(),

    minPrice: z
        .number({
            invalid_type_error: "Minimum price must be a number",
        })
        .min(0, "Minimum price must be 0 or greater")
        .optional(),

    maxPrice: z
        .number({
            invalid_type_error: "Maximum price must be a number",
        })
        .min(0, "Maximum price must be 0 or greater")
        .optional(),

    startDate: z
        .string({
            invalid_type_error: "Start date must be a string",
        })
        .refine((d) => !isNaN(Date.parse(d)), "Invalid start date")
        .optional(),

    endDate: z
        .string({
            invalid_type_error: "End date must be a string",
        })
        .refine((d) => !isNaN(Date.parse(d)), "Invalid end date")
        .optional(),

    isBlocked: z
        .boolean({
            invalid_type_error: "isBlocked must be a boolean",
        })
        .optional(),
});
