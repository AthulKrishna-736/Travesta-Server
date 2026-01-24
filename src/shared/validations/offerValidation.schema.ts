import z from "zod";

export const createOfferSchema = z.object({
    name: z.string()
        .min(3, "Offer name must be at least 3 characters")
        .max(50, "Offer name must be less than 50 characters"),

    hotelId: z.string().optional(),

    roomType: z.enum(["AC", "Non-AC", "Deluxe", "Suite", "Standard"], {
        required_error: "Room type is required"
    }),

    discountType: z.enum(["flat", "percent"], {
        required_error: "Discount type is required"
    }),

    discountValue: z.number()
        .min(1, "Discount value must be at least 1"),

    startDate: z.string()
        .refine((d) => !isNaN(Date.parse(d)), "Invalid start date"),

    expiryDate: z.string()
        .refine((d) => !isNaN(Date.parse(d)), "Invalid expiry date"),
});


export const updateOfferSchema = z.object({
    name: z.string()
        .min(3, "Offer name must be at least 3 characters")
        .max(50, "Offer name must be less than 50 characters")
        .optional(),

    hotelId: z.string().nullable().optional(),

    roomType: z.enum(["AC", "Non-AC", "Deluxe", "Suite", "Standard"]).optional(),

    discountType: z.enum(["flat", "percent"]).optional(),

    discountValue: z.number()
        .min(1, "Discount value must be at least 1")
        .optional(),

    startDate: z.string()
        .refine((d) => !isNaN(Date.parse(d)), "Invalid start date")
        .optional(),

    expiryDate: z.string()
        .refine((d) => !isNaN(Date.parse(d)), "Invalid expiry date")
        .optional(),

    isBlocked: z.boolean().optional(),
});
