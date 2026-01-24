import z from "zod";

export const createRoomSchema = z.object({
    hotelId: z.string({
        required_error: "Hotel ID is required",
        invalid_type_error: "Hotel ID must be a string",
    }),

    name: z.string({
        required_error: "Room name is required",
        invalid_type_error: "Room name must be a string",
    })
        .min(3, "Room name must be at least 3 characters")
        .max(50, "Room name must be less than 50 characters"),

    roomType: z.string({
        required_error: "Room type is required",
    }),

    roomCount: z.preprocess(
        (val) => Number(val),
        z.number().int().min(1, "At least 1 room is required")
    ),

    bedType: z.string({
        required_error: "Bed type is required",
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
        invalid_type_error: "Hotel ID must be a string",
    }).optional(),

    name: z.string({
        invalid_type_error: "Room name must be a string",
    })
        .min(3, "Room name must be at least 3 characters")
        .max(50, "Room name must be less than 50 characters")
        .regex(/^[a-zA-Z0-9\s\-&,]+$/, "Room name contains invalid characters")
        .optional(),

    roomType: z.string({
        invalid_type_error: "Room type must be a string",
    }).optional(),

    roomCount: z.preprocess(
        (val) => (val !== undefined ? Number(val) : undefined),
        z.number()
            .int("Room count must be an integer")
            .min(1, "At least 1 room is required")
    ).optional(),

    bedType: z.string({
        invalid_type_error: "Bed type must be a string",
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