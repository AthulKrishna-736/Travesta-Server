import { z } from "zod";

const nameSchema = z
    .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    })
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z]/, "Coupon name can only contain letters");

const codeSchema = z
    .string({
        required_error: "Coupon code is required",
        invalid_type_error: "Coupon code must be a string",
    })
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code must be less than 20 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "Coupon code can only contain letters, numbers, and hyphens");

const typeSchema = z.enum(["flat", "percent"], {
    required_error: "Invalid type",
    invalid_type_error: "Invalid type",
});

const valueSchema = z
    .number({
        required_error: "Value is required",
        invalid_type_error: "Value must be a number",
    })
    .min(1, "Value must be at least 1")
    .max(100000, "Max value should not exceed 100,000");

const countSchema = z
    .number({
        required_error: "Count is required",
        invalid_type_error: "Count must be a number",
    })
    .min(1, "Count must be at least 1")
    .max(100, "Max coupon count limit is 100");

const minPriceSchema = z
    .number({
        required_error: "Minimum price required",
        invalid_type_error: "Minimum price must be a number",
    })
    .min(0, "Min price must be 0 or greater")
    .max(100000, "Min price should not exceed 100,000");

const maxPriceSchema = z
    .number({
        required_error: "Maximum price required",
        invalid_type_error: "Maximum price must be a number",
    })
    .min(500, "Max price must be greater than 500")
    .max(100000, "Max price should not exceed 100,000");

const isoDateSchema = z
    .string({
        required_error: "Date required",
        invalid_type_error: "Date must be a string",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const couponBaseSchema = {
    name: nameSchema,
    code: codeSchema,
    type: typeSchema,
    value: valueSchema,
    count: countSchema,
    minPrice: minPriceSchema,
    maxPrice: maxPriceSchema,
    startDate: isoDateSchema,
    endDate: isoDateSchema,
};

export const createCouponSchema = z
    .object(couponBaseSchema)

    .refine((d) => d.maxPrice >= d.minPrice, {
        message: "Max price must be greater than Min price",
        path: ["maxPrice"],
    })

    .refine((d) => d.type !== "percent" || d.value <= 50, {
        message: "Percent discount cannot exceed 50%",
        path: ["value"],
    })

    .refine((d) => d.type !== "flat" || d.maxPrice !== undefined, {
        message: "Max price is required for flat discount",
        path: ["maxPrice"],
    })

    .refine((d) => d.type !== "flat" || d.value <= d.maxPrice * 0.3, {
        message: "Flat discount cannot exceed 30% of max price",
        path: ["value"],
    });


export const updateCouponSchema = z
    .object(couponBaseSchema)
    .partial()

    .extend({
        isBlocked: z.boolean({
            invalid_type_error: "isBlocked must be a boolean",
        }).optional(),
    })

    .refine((d) => d.minPrice === undefined || d.maxPrice === undefined || d.maxPrice >= d.minPrice, {
        message: "Max price must be greater than Min price",
        path: ["maxPrice"],
    })

    .refine((d) => d.type !== "percent" || d.value === undefined || d.value <= 50, {
        message: "Percent discount cannot exceed 50%",
        path: ["value"],
    })

    .refine((d) => d.type !== "flat" || d.maxPrice !== undefined, {
        message: "Max price is required for flat discount",
        path: ["maxPrice"],
    })

    .refine((d) => d.type !== "flat" || d.value === undefined || d.maxPrice === undefined || d.value <= d.maxPrice * 0.3, {
        message: "Flat discount cannot exceed 30% of max price",
        path: ["value"],
    });
