import { z } from "zod"

//createuser
export const createUserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z
        .string()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    role: z.enum(["user", "vendor", "admin"]),
    subscriptionType: z.enum(["basic", "medium", "vip"]),
})

//update user
export const updateUserSchema = z.object({
    firstName: z.string().min(1, "First name cannot be empty").optional(),
    lastName: z.string().min(1, "Last name cannot be empty").optional(),
    phone: z
        .string()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .optional(),
    profileImage: z
        .string()
        .url("Profile image must be a valid URL")
        .optional(),
    subscriptionType: z.enum(["basic", "medium", "vip"]).optional(),
    verificationReason: z.string().min(1).optional(),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
});


//login user
export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

//verifyotp
export const verifyOtp = z.object({
    userId: z.string(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    purpose: z.enum(['signup', 'reset'], {
        required_error: 'Purpose is required',
        invalid_type_error: 'Purpose must be either "signup" or "reset"',
    })
});

//resentotp
export const resendOtpSchema = z.object({
    userId: z.string({
        required_error: 'UserId is required',
        invalid_type_error: 'UserId must be a string',
    }),
});


//forgotpass
export const forgotPassSchema = z.object({
    email: z.string().email('Email is required'),
    role: z.string({
        required_error: 'Role is required',
        invalid_type_error: 'Role must be string'
    })
})

//updatepass
export const updatePassSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
})

//google login 
export const googleLoginSchema = z.object({
    credential: z.string({
        required_error: 'Credentials is required',
        invalid_type_error: 'Credential must be string'
    }),
    role: z.string({
        required_error: 'Role is required',
        invalid_type_error: 'Role must be string'
    })
})


//createhotel
export const createHotelSchema = z.object({
    name: z.string({
        required_error: "Hotel name is required",
        invalid_type_error: "Hotel name must be a string",
    })
        .min(3, "Hotel name must be at least 3 characters")
        .max(100, "Hotel name must be less than 100 characters")
        .regex(/^[a-zA-Z0-9\s\-\&\,]+$/, "Hotel name contains invalid characters (only letters, numbers, spaces, -, &, , allowed)"),

    description: z.string({
        required_error: "Description is required",
        invalid_type_error: "Description must be a string",
    })
        .min(10, "Description must be at least 10 characters"),

    amenities: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.array(z.string({ invalid_type_error: "Each amenity must be a string" }))
            .min(1, "At least one amenity is required")
    ),

    tags: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.array(z.string()).default([])
    ),

    state: z.string({
        required_error: "State is required",
        invalid_type_error: "State must be a string",
    }),

    city: z.string({
        required_error: "City is required",
        invalid_type_error: "City must be a string",
    }),

    address: z.string({
        required_error: "Address is required",
        invalid_type_error: "Address must be a string",
    }).min(5, "Address must be at least 5 characters"),

    geoLocation: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        z.tuple([
            z.number({ invalid_type_error: "Latitude must be a number" }),
            z.number({ invalid_type_error: "Longitude must be a number" }),
        ])
    ),

    rating: z.preprocess(
        (val) => Number(val),
        z.number({ invalid_type_error: "Rating must be a number" })
            .min(0, "Rating must be at least 0")
            .max(5, "Rating cannot exceed 5")
    ).optional(),
});

export const updateHotelSchema = z.object({
    name: z.string()
        .min(3, "Hotel name must be at least 3 characters")
        .max(100, "Hotel name must be less than 100 characters")
        .regex(/^[a-zA-Z0-9\s\-\&\,]+$/, "Hotel name contains invalid characters")
        .optional(),

    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .regex(/^[a-zA-Z0-9\s\-\&\,]+$/, "Description contains invalid characters")
        .optional(),

    rating: z.preprocess(
        (val) => val !== undefined ? Number(val) : undefined,
        z.number()
            .min(0, "Rating must be at least 0")
            .max(5, "Rating cannot exceed 5")
    ).optional(),

    services: z.preprocess(
        (val) => typeof val === "string" ? JSON.parse(val) : val,
        z.array(z.string().min(1, "Service must be a non-empty string"))
            .min(1, "At least one service is required")
    ).optional(),

    amenities: z.preprocess(
        (val) => typeof val === "string" ? JSON.parse(val) : val,
        z.array(z.string().min(1, "Amenity must be a non-empty string"))
            .min(1, "At least one amenity is required")
    ).optional(),

    tags: z.preprocess(
        (val) => typeof val === "string" ? JSON.parse(val) : val,
        z.array(z.string().min(1, "Tag must be a non-empty string"))
    ).optional(),

    state: z.string().optional(),

    city: z.string().optional(),

    address: z.string()
        .min(5, "Address must be at least 5 characters")
        .optional(),

    geoLocation: z.preprocess(
        (val) => typeof val === "string" ? JSON.parse(val) : val,
        z.tuple([
            z.number({ invalid_type_error: "Latitude must be a number" }),
            z.number({ invalid_type_error: "Longitude must be a number" }),
        ])
    ).optional(),
});


//subscription schema
export const subscriptionSchema = z.object({
    name: z.string({
        required_error: 'name is required',
        invalid_type_error: 'name must be string',
    })
        .min(3, 'name must be at dleast 3 characters'),

    description: z.string({
        required_error: 'description is required',
        invalid_type_error: 'description must be string'
    })
        .min(10, 'description must be at least 10 characters'),

    type: z.enum(['basic', 'medium', 'vip'], {
        required_error: 'type is required',
        invalid_type_error: 'invalid type should be specified ones'
    }).optional(),

    price: z.number({
        required_error: 'price is required',
        invalid_type_error: 'price should be positive number'
    }).positive(),

    duration: z.number({
        required_error: 'duration is required',
        invalid_type_error: 'duration should be in days'
    }).int().positive(),

    features: z.array(z.string({ invalid_type_error: 'features should be of string' }))
        .nonempty('features must have at least one item'),
});


//room schema
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
        .regex(/^[a-zA-Z0-9\s\-\&\,]+$/, "Room name contains invalid characters")
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
        .regex(/^[a-zA-Z0-9\s\-\&\,]+$/, "Bed type contains invalid characters")
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
