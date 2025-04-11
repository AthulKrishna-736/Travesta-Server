import { z } from "zod"
import { TRole, TSubscription } from "../../../shared/types/user.types"


export interface CreateUserDTO {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: number
    role: TRole
    subscriptionType: TSubscription
}

export interface UpdateUserDTO {
    firstName?: string
    lastName?: string
    phone?: number
    profileImage: string
    subscriptionType?: TSubscription
}

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

export type CreateUserSchemaType  = z.infer<typeof createUserSchema>


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

export type UpdateUserSchemaType  = z.infer<typeof updateUserSchema>
