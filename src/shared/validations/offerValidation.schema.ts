
import { z } from "zod";

// Reusable required string
const requiredString = (field: string) =>
    z.string({
        error: (issue) =>
            issue.input === undefined
                ? `${field} is required`
                : `${field} must be a string`,
    });

// Date
const isoDateString = requiredString("Date")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

// Room type
const RoomTypeEnum = z.enum(
    ["AC", "Non-AC", "Deluxe", "Suite", "Standard"],
    {
        error: "Room type is required",
    }
);

// Discount type
const DiscountTypeEnum = z.enum(["flat", "percent"], {
    error: "Discount type is required",
});

// Base offer schema
const offerBaseSchema = {
    name: requiredString("Name")
        .min(3, "Minimum 3 characters required")
        .max(50, "Maximum of 50 characters allowed")
        .regex(
            /^[a-zA-Z0-9-]+$/,
            "Offer name can only contain letters, numbers, and hyphen"
        ),

    hotelId: z.string({
        error: "Hotel ID must be a string",
    }).nullable(),

    roomType: RoomTypeEnum,

    discountType: DiscountTypeEnum,

    discountValue: z.number({
        error: (issue) =>
            issue.input === undefined
                ? "Discount value is required"
                : "Discount value must be a number",
    })
        .min(1, "Discount must be at least 1")
        .max(100000, "Max discount upto 100,000"),

    startDate: isoDateString,

    expiryDate: isoDateString,
};

// Create offer
export const createOfferSchema = z
    .object({
        name: offerBaseSchema.name,
        hotelId: offerBaseSchema.hotelId.optional(),
        roomType: offerBaseSchema.roomType,
        discountType: offerBaseSchema.discountType,
        discountValue: offerBaseSchema.discountValue,
        startDate: offerBaseSchema.startDate,
        expiryDate: offerBaseSchema.expiryDate,
    })
    .superRefine((data, ctx) => {
        if (data.discountType === "percent" && data.discountValue > 50) {
            ctx.addIssue({
                path: ["discountValue"],
                message: "Percent offer cannot exceed 50%",
                code: "custom",
            });
        }

        if (data.discountType === "flat" && data.discountValue > 5000) {
            ctx.addIssue({
                path: ["discountValue"],
                message: "Flat discount too high",
                code: "custom",
            });
        }

        if (data.expiryDate < data.startDate) {
            ctx.addIssue({
                path: ["expiryDate"],
                message: "Expiry date must be after start date",
                code: "custom",
            });
        }
    });

// Update offer
export const updateOfferSchema = z
    .object({
        name: offerBaseSchema.name.optional(),
        hotelId: offerBaseSchema.hotelId.optional(),
        roomType: offerBaseSchema.roomType.optional(),
        discountType: offerBaseSchema.discountType.optional(),
        discountValue: offerBaseSchema.discountValue.optional(),
        startDate: offerBaseSchema.startDate.optional(),
        expiryDate: offerBaseSchema.expiryDate.optional(),

        isBlocked: z.boolean({
            error: "isBlocked must be a boolean",
        }).optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.discountType === "percent" &&
            data.discountValue !== undefined &&
            data.discountValue > 50
        ) {
            ctx.addIssue({
                path: ["discountValue"],
                message: "Percent offer cannot exceed 50%",
                code: "custom",
            });
        }

        if (
            data.discountType === "flat" &&
            data.discountValue !== undefined &&
            data.discountValue > 5000
        ) {
            ctx.addIssue({
                path: ["discountValue"],
                message: "Flat discount too high",
                code: "custom",
            });
        }

        if (
            data.startDate &&
            data.expiryDate &&
            data.expiryDate < data.startDate
        ) {
            ctx.addIssue({
                path: ["expiryDate"],
                message: "Expiry date must be after start date",
                code: "custom",
            });
        }
    });
