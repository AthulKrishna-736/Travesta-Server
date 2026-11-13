
import { z } from "zod";

const requiredString = (field: string) =>
    z.string({
        error: (issue) =>
            issue.input === undefined
                ? `${field} is required`
                : `${field} must be a string`,
    });

const requiredNumber = (field: string) =>
    z.number({
        error: (issue) =>
            issue.input === undefined
                ? `${field} is required`
                : `${field} must be a number`,
    });

// Name
const nameSchema = requiredString("Name")
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z]/, "Coupon name can only contain letters");

// Coupon code
const codeSchema = requiredString("Coupon code")
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code must be less than 20 characters")
    .regex(
        /^[a-zA-Z0-9-]+$/,
        "Coupon code can only contain letters, numbers, and hyphens"
    );

// Coupon type
const typeSchema = z.enum(["flat", "percent"], {
    error: "Invalid type",
});

// Value
const valueSchema = requiredNumber("Value")
    .min(1, "Value must be at least 1")
    .max(100000, "Max value should not exceed 100,000");

// Count
const countSchema = requiredNumber("Count")
    .min(1, "Count must be at least 1")
    .max(100, "Max coupon count limit is 100");

// Minimum price
const minPriceSchema = requiredNumber("Minimum price")
    .min(0, "Min price must be 0 or greater")
    .max(100000, "Min price should not exceed 100,000");

// Maximum price
const maxPriceSchema = requiredNumber("Maximum price")
    .min(500, "Max price must be greater than 500")
    .max(100000, "Max price should not exceed 100,000");

// Date
const isoDateSchema = requiredString("Date")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

// Base coupon schema
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

// Create coupon
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

// Update coupon
export const updateCouponSchema = z
    .object(couponBaseSchema)
    .partial()

    .extend({
        isBlocked: z.boolean({
            error: "isBlocked must be a boolean",
        }).optional(),
    })

    .refine(
        (d) =>
            d.minPrice === undefined ||
            d.maxPrice === undefined ||
            d.maxPrice >= d.minPrice,
        {
            message: "Max price must be greater than Min price",
            path: ["maxPrice"],
        }
    )

    .refine(
        (d) =>
            d.type !== "percent" ||
            d.value === undefined ||
            d.value <= 50,
        {
            message: "Percent discount cannot exceed 50%",
            path: ["value"],
        }
    )

    .refine((d) => d.type !== "flat" || d.maxPrice !== undefined, {
        message: "Max price is required for flat discount",
        path: ["maxPrice"],
    })

    .refine(
        (d) =>
            d.type !== "flat" ||
            d.value === undefined ||
            d.maxPrice === undefined ||
            d.value <= d.maxPrice * 0.3,
        {
            message: "Flat discount cannot exceed 30% of max price",
            path: ["value"],
        }
    );
