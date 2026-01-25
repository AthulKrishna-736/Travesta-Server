import { z } from "zod";

export const createAmenitySchema = z.object({
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .regex(/^[A-Za-z\s]+$/, "Name must contain only letters and spaces"),

    description: z
        .string({
            required_error: "Description is required",
            invalid_type_error: "Description must be a string",
        })
        .min(5, "Description must be at least 5 characters")
        .max(100, "Description must be less than 100 characters")
        .regex(
            /^[A-Za-z0-9\s,.'"-?!()&]+$/,
            "Description can contain letters, numbers, spaces, and basic punctuation"
        ),
});
