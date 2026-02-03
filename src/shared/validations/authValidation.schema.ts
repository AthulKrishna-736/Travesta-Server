import { z } from "zod"

const firstName = z.string({
    required_error: "First name is required",
    invalid_type_error: "First name must be a string",
})
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name cannot exceed 30 characters");

const lastName = z.string({
    required_error: "Last name is required",
    invalid_type_error: "Last name must be a string",
})
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name cannot exceed 30 characters");

const email = z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
})
    .trim()
    .email("Invalid email address")
    .max(50, "Email cannot exceed 50 characters");

const password = z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
})
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password cannot exceed 30 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/\d/, "Must include a number")
    .regex(/[!@#$%^&*]/, "Must include a special character");

const phone = z.string({
    required_error: "Phone number is required",
    invalid_type_error: "Phone number must be a string",
}).regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const role = z.enum(["user", "vendor", "admin"], {
    required_error: "Role is required",
    invalid_type_error: "Invalid role value",
});

const subscriptionType = z.enum(["basic", "medium", "vip"], {
    required_error: "Subscription type is required",
    invalid_type_error: "Invalid subscription type",
});


//createuser
export const createUserSchema = z.object({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: z.enum(["user", "vendor"], {
        required_error: "Role is required",
        invalid_type_error: "Invalid role value",
    }),
    subscriptionType,
})

//update user
export const updateUserSchema = z.object({
    firstName: firstName.optional(),
    lastName: lastName.optional(),
    email: email.optional(),
    password: password.optional(),
    phone: phone.optional(),
    subscriptionType: subscriptionType.optional(),
    profileImage: z.string({
        invalid_type_error: "Profile image must be a string",
    })
        .url("Profile image must be a valid URL")
        .optional(),

    verificationReason: z.string({
        invalid_type_error: "Verification reason must be a string",
    })
        .min(1, "Verification reason cannot be empty")
        .optional(),

    isVerified: z.boolean({
        invalid_type_error: "isVerified must be a boolean",
    }).optional(),

    isBlocked: z.boolean({
        invalid_type_error: "isBlocked must be a boolean",
    }).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});


//login user
export const loginSchema = z.object({
    email,
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    }).min(6, "Password must be at least 6 characters")
});

//verifyotp
export const verifyOtp = z.object({
    userId: z.string({
        required_error: 'UserId is required',
        invalid_type_error: 'UserId must be a string',
    }),
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
    email,
    role,
})

//updatepass
export const updatePassSchema = z.object({
    oldPassword: password,
    newPassword: password,
})

//google login 
export const googleLoginSchema = z.object({
    credential: z.string({
        required_error: 'Credentials is required',
        invalid_type_error: 'Credential must be string'
    }),
    role,
})