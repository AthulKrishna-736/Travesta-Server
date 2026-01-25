import { z } from "zod";

export const ratingSchema = z.object({
    hospitality: z
        .number({
            required_error: "Hospitality rating is required",
            invalid_type_error: "Hospitality rating must be a number",
        })
        .min(1, "Minimum rating is 1 star")
        .max(5, "Maximum rating is 5 stars"),

    cleanliness: z
        .number({
            required_error: "Cleanliness rating is required",
            invalid_type_error: "Cleanliness rating must be a number",
        })
        .min(1, "Minimum rating is 1 star")
        .max(5, "Maximum rating is 5 stars"),

    facilities: z
        .number({
            required_error: "Facilities rating is required",
            invalid_type_error: "Facilities rating must be a number",
        })
        .min(1, "Minimum rating is 1 star")
        .max(5, "Maximum rating is 5 stars"),

    room: z
        .number({
            required_error: "Room rating is required",
            invalid_type_error: "Room rating must be a number",
        })
        .min(1, "Minimum rating is 1 star")
        .max(5, "Maximum rating is 5 stars"),

    moneyValue: z
        .number({
            required_error: "Value for money rating is required",
            invalid_type_error: "Value for money rating must be a number",
        })
        .min(1, "Minimum rating is 1 star")
        .max(5, "Maximum rating is 5 stars"),

    review: z
        .string({
            required_error: "Review is required",
            invalid_type_error: "Review must be a string",
        })
        .min(20, "Review must be at least 20 characters")
        .max(400, "Review cannot exceed 400 characters"),
});
