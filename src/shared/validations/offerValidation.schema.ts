import z from "zod";


export const createOfferSchema = z.object({
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(3, "Minimum 3 character required")
        .max(50, "Maximum of 50 characters are allowed"),

    hotelId: z
        .string({
            invalid_type_error: "Hotel ID must be a string",
        })
        .nullable()
        .optional(),

    roomType: z.enum(
        ["AC", "Non-AC", "Deluxe", "Suite", "Standard"],
        {
            required_error: "Room Type is required",
            invalid_type_error: "Room Type is required",
        }
    ),

    discountType: z.enum(
        ["flat", "percent"],
        {
            required_error: "Discount type is required",
            invalid_type_error: "Discount type is required",
        }
    ),

    discountValue: z
        .number({
            required_error: "Discount value is required",
            invalid_type_error: "Discount value must be a number",
        })
        .min(1, "Discount must be at least 1"),

    startDate: z.string({
        required_error: "Start date is required",
        invalid_type_error: "Start date must be a string",
    }),

    expiryDate: z.string({
        required_error: "End date is required",
        invalid_type_error: "End date must be a string",
    }),
});


export const updateOfferSchema = z.object({
    name: z
        .string({
            invalid_type_error: "Name must be a string",
        })
        .min(3, "Offer name must be at least 3 characters")
        .max(50, "Offer name must be less than 50 characters")
        .optional(),

    hotelId: z
        .string({
            invalid_type_error: "Hotel ID must be a string",
        })
        .nullable()
        .optional(),

    roomType: z
        .enum(["AC", "Non-AC", "Deluxe", "Suite", "Standard"], {
            invalid_type_error: "Invalid room type",
        })
        .optional(),

    discountType: z
        .enum(["flat", "percent"], {
            invalid_type_error: "Invalid discount type",
        })
        .optional(),

    discountValue: z
        .number({
            invalid_type_error: "Discount value must be a number",
        })
        .min(1, "Discount value must be at least 1")
        .optional(),

    startDate: z
        .string({
            invalid_type_error: "Start date must be a string",
        })
        .refine((d) => !isNaN(Date.parse(d)), "Invalid start date")
        .optional(),

    expiryDate: z
        .string({
            invalid_type_error: "Expiry date must be a string",
        })
        .refine((d) => !isNaN(Date.parse(d)), "Invalid expiry date")
        .optional(),

    isBlocked: z
        .boolean({
            invalid_type_error: "isBlocked must be a boolean",
        })
        .optional(),
});
