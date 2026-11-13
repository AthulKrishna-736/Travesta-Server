
import { z } from "zod";

// Reusable error handler for required string fields
const requiredString = (field: string) =>
    z.string({
        error: (issue) =>
            issue.input === undefined
                ? `${field} is required`
                : `${field} must be a string`,
    });

// Reusable error handler for optional string fields
const optionalString = (field: string) =>
    z.string({
        error: `${field} must be a string`,
    });

// First name
const firstName = requiredString("First name")
    .min(2, "First name must be at least 2 characters")
    .max(30, "First name cannot exceed 30 characters");

// Last name
const lastName = requiredString("Last name")
    .min(2, "Last name must be at least 2 characters")
    .max(30, "Last name cannot exceed 30 characters");

// Email
const email = requiredString("Email")
    .trim()
    .email("Invalid email address")
    .max(50, "Email cannot exceed 50 characters");

// Password
const password = requiredString("Password")
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password cannot exceed 30 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/\d/, "Must include a number")
    .regex(/[!@#$%^&*]/, "Must include a special character");

// Phone
const phone = requiredString("Phone number")
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

// Roles
const role = z.enum(["user", "vendor", "admin"], {
    error: (issue) =>
        issue.input === undefined
            ? "Role is required"
            : "Invalid role value",
});

const subscriptionType = z.enum(["basic", "medium", "vip"], {
    error: (issue) =>
        issue.input === undefined
            ? "Subscription type is required"
            : "Invalid subscription type",
});

// Create user
export const createUserSchema = z.object({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: z.enum(["user", "vendor"], {
        error: (issue) =>
            issue.input === undefined
                ? "Role is required"
                : "Invalid role value",
    }),
    subscriptionType,
});

// Update user
export const updateUserSchema = z.object({
    firstName: firstName.optional(),
    lastName: lastName.optional(),
    email: email.optional(),
    password: password.optional(),
    phone: phone.optional(),
    subscriptionType: subscriptionType.optional(),

    profileImage: optionalString("Profile image")
        .url("Profile image must be a valid URL")
        .optional(),

    verificationReason: optionalString("Verification reason")
        .min(1, "Verification reason cannot be empty")
        .optional(),

    isVerified: z.boolean({
        error: "isVerified must be a boolean",
    }).optional(),

    isBlocked: z.boolean({
        error: "isBlocked must be a boolean",
    }).optional(),

}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

// Login user
export const loginSchema = z.object({
    email,
    password: requiredString("Password")
        .min(6, "Password must be at least 6 characters"),
});

// Verify OTP
export const verifyOtp = z.object({
    userId: requiredString("UserId"),

    otp: requiredString("OTP")
        .length(6, "OTP must be 6 digits"),

    purpose: z.enum(["signup", "reset"], {
        error: (issue) =>
            issue.input === undefined
                ? "Purpose is required"
                : 'Purpose must be either "signup" or "reset"',
    }),
});

// Resend OTP
export const resendOtpSchema = z.object({
    userId: requiredString("UserId"),
});

// Forgot password
export const forgotPassSchema = z.object({
    email,
    role,
});

// Update password
export const updatePassSchema = z.object({
    oldPassword: password,
    newPassword: password,
});

// Google login
export const googleLoginSchema = z.object({
    credential: requiredString("Credentials"),
    role,
});
