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
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z
        .string()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .optional(),
    profileImage: z.string().url("Profile image must be a valid URL").optional(),
    subscriptionType: z.enum(["basic", "medium", "vip"]).optional(),
})

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


