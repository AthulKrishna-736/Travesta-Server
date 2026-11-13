
import z from "zod";

export const createRoomSchema = z.object({
    hotelId: z.string({
        error: "Hotel ID is required",
    }),

    name: z.string({
        error: "Room name is required",
    })
        .min(3, "Room name must be at least 3 characters")
        .max(50, "Room name must be less than 50 characters"),

    roomType: z.string({
        error: "Room type is required",
    }),

    roomCount: z.preprocess(
        (val) => Number(val),
        z.number().int().min(1, "At least 1 room is required")
    ),

    bedType: z.string({
        error: "Bed type is required",
    }),

    guest: z.preprocess(
        (val) => Number(val),
        z.number().int().min(1, "Guest capacity must be at least 1")
    ),

    basePrice: z.preprocess(
        (val) => Number(val),
        z.number().gt(0, "Base price must be greater than 0")
    ),

    amenities: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.array(z.string()).min(1, "At least one amenity is required")
    ),
});

export const updateRoomSchema = z.object({
    hotelId: z.string({
        error: "Hotel ID must be a string",
    }).optional(),

    name: z.string({
        error: "Room name must be a string",
    })
        .min(3, "Room name must be at least 3 characters")
        .max(50, "Room name must be less than 50 characters")
        .regex(/^[a-zA-Z0-9\s\-&,]+$/, "Room name contains invalid characters")
        .optional(),

    roomType: z.string({
        error: "Room type must be a string",
    }).optional(),

    roomCount: z.preprocess(
        (val) => (val !== undefined ? Number(val) : undefined),
        z.number()
            .int("Room count must be an integer")
            .min(1, "At least 1 room is required")
    ).optional(),

    bedType: z.string({
        error: "Bed type must be a string",
    })
        .min(3, "Bed type must be at least 3 characters")
        .max(50, "Bed type must be less than 50 characters")
        .regex(/^[a-zA-Z0-9\s\-&,]+$/, "Bed type contains invalid characters")
        .optional(),

    guest: z.preprocess(
        (val) => (val !== undefined ? Number(val) : undefined),
        z.number()
            .int("Guest capacity must be an integer")
            .min(1, "Guest capacity must be at least 1")
    ).optional(),

    basePrice: z.preprocess(
        (val) => (val !== undefined ? Number(val) : undefined),
        z.number()
            .gt(0, "Base price must be greater than 0")
    ).optional(),

    amenities: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.array(z.string()).min(1, "At least one amenity is required")
    ).optional(),

    images: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.array(z.string()).optional()
    ),
});

export const createBookingSchema = z.object({
    vendorId: z.string({
        error: "Vendor ID is required",
    }),

    hotelId: z.string({
        error: "Hotel ID is required",
    }),

    roomId: z.string({
        error: "Room ID is required",
    }),

    checkIn: z.string({
        error: "Check-in date is required",
    }).datetime({
        error: "Invalid check-in date format",
    }),

    checkOut: z.string({
        error: "Check-out date is required",
    }).datetime({
        error: "Invalid check-out date format",
    }),

    guests: z.number({
        error: "Guests count is required",
    })
        .int("Guests must be an integer")
        .min(1, "At least 1 guest is required")
        .max(10, "Guests limit exceeded"),

    roomsCount: z.number({
        error: "Rooms count is required",
    })
        .int("Rooms count must be an integer")
        .min(1, "Minimum 1 room required")
        .max(5, "Maximum 5 rooms allowed"),

    couponId: z.string({
        error: "Invalid Coupon Id",
    }).nullable().optional(),

    method: z.enum(["wallet", "online"], {
        error: "Invalid or missing payment method",
    }),
})
    .refine(
        (data) => new Date(data.checkOut) > new Date(data.checkIn),
        {
            message: "Check-out date must be after check-in date",
            path: ["checkOut"],
        }
    );
