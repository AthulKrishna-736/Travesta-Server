
import { z } from "zod";

const requiredNumber = (field: string) =>
    z.number({
        error: (issue) =>
            issue.input === undefined
                ? `${field} is required`
                : `${field} must be a number`,
    })
        .min(1, "Minimum rating is 1 star")
        .max(5, "Maximum rating is 5 stars");

export const ratingSchema = z.object({
    hospitality: requiredNumber("Hospitality rating"),

    cleanliness: requiredNumber("Cleanliness rating"),

    facilities: requiredNumber("Facilities rating"),

    room: requiredNumber("Room rating"),

    moneyValue: requiredNumber("Value for money rating"),

    review: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? "Review is required"
                    : "Review must be a string",
        })
        .min(20, "Review must be at least 20 characters")
        .max(400, "Review cannot exceed 400 characters"),
});
