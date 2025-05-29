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
const nameRegex = /^[A-Za-z\s]+$/;
const tagAmenityServiceRegex = /^[a-zA-Z0-9,\s]+$/;
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const createHotelSchema = z.object({
    body: z.object({
        name: z
            .string()
            .regex(nameRegex, 'Name must contain only letters and spaces')
            .min(1, 'Hotel name is required'),

        description: z
            .string()
            .min(10, 'Description must be at least 10 characters'),

        address: z
            .string()
            .min(5, 'Address must be at least 5 characters'),

        state: z
            .string()
            .regex(nameRegex, 'State must contain only letters and spaces'),

        city: z
            .string()
            .regex(nameRegex, 'City must contain only letters and spaces'),

        tags: z
            .string()
            .regex(tagAmenityServiceRegex, 'Tags must be letters, numbers, or commas'),

        amenities: z
            .string()
            .regex(tagAmenityServiceRegex, 'Amenities must be letters, numbers, or commas'),

        services: z
            .string()
            .regex(tagAmenityServiceRegex, 'Services must be letters, numbers, or commas'),
    }),

    file: z
        .any()
        .refine((files) => Array.isArray(files) && files.length > 0, {
            message: 'At least one image is required',
        })
        .refine((files: Express.Multer.File[]) =>
            files.every(file => SUPPORTED_IMAGE_FORMATS.includes(file.mimetype)),
            {
                message: 'Only JPG, PNG, or WEBP files are allowed',
            }
        ),
});
