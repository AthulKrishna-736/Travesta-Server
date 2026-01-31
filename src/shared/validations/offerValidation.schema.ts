import { z } from "zod";

const isoDateString = z
    .string({
        required_error: "Date is required",
        invalid_type_error: "Date must be a string",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const RoomTypeEnum = z.enum(["AC", "Non-AC", "Deluxe", "Suite", "Standard"], {
    required_error: "Room type is required",
    invalid_type_error: "Room type is required",
});

const DiscountTypeEnum = z.enum(["flat", "percent"], {
    required_error: "Discount type is required",
    invalid_type_error: "Discount type is required",
});


const offerBaseSchema = {
    name: z
        .string({
            invalid_type_error: "Name must be a string",
            required_error: 'Name is required',
        })
        .min(3, "Minimum 3 characters required")
        .max(50, "Maximum of 50 characters allowed")
        .regex(/^[a-zA-Z0-9-]+$/, 'Offer name can only contain letters, numbers, and hyphen'),
    hotelId: z
        .string({
            invalid_type_error: "Hotel ID must be a string",
        })
        .nullable(),
    roomType: RoomTypeEnum,
    discountType: DiscountTypeEnum,
    discountValue: z
        .number({
            invalid_type_error: "Discount value must be a number",
        })
        .min(1, "Discount must be at least 1")
        .max(100000, "Max discount upto 100,000"),
    startDate: isoDateString,
    expiryDate: isoDateString,
};

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
                code: z.ZodIssueCode.custom,
            });
        }

        if (data.discountType === "flat" && data.discountValue > 5000) {
            ctx.addIssue({
                path: ["discountValue"],
                message: "Flat discount too high",
                code: z.ZodIssueCode.custom,
            });
        }

        if (data.expiryDate < data.startDate) {
            ctx.addIssue({
                path: ["expiryDate"],
                message: "Expiry date must be after start date",
                code: z.ZodIssueCode.custom,
            });
        }
    });

export const updateOfferSchema = z
    .object({
        name: offerBaseSchema.name.optional(),
        hotelId: offerBaseSchema.hotelId.optional(),
        roomType: offerBaseSchema.roomType.optional(),
        discountType: offerBaseSchema.discountType.optional(),
        discountValue: offerBaseSchema.discountValue.optional(),
        startDate: offerBaseSchema.startDate.optional(),
        expiryDate: offerBaseSchema.expiryDate.optional(),

        isBlocked: z
            .boolean({ invalid_type_error: "isBlocked must be a boolean" })
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.discountType === "percent" && data.discountValue !== undefined && data.discountValue > 50) {
            ctx.addIssue({
                path: ["discountValue"],
                message: "Percent offer cannot exceed 50%",
                code: z.ZodIssueCode.custom,
            });
        }

        if (data.discountType === "flat" && data.discountValue !== undefined && data.discountValue > 5000) {
            ctx.addIssue({
                path: ["discountValue"],
                message: "Flat discount too high",
                code: z.ZodIssueCode.custom,
            });
        }

        if (data.startDate && data.expiryDate && data.expiryDate < data.startDate) {
            ctx.addIssue({
                path: ["expiryDate"],
                message: "Expiry date must be after start date",
                code: z.ZodIssueCode.custom,
            });
        }
    });
