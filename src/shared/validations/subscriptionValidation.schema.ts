
import z from "zod";

export const subscriptionSchema = z.object({
    name: z.string({
        error: "name is required and must be a string",
    })
        .min(3, "name must be at least 3 characters"),

    description: z.string({
        error: "description is required and must be a string",
    })
        .min(10, "description must be at least 10 characters"),

    type: z.enum(["basic", "medium", "vip"], {
        error: "invalid or missing type. Specify basic, medium, or vip",
    }).optional(),

    price: z.number({
        error: "price is required and must be a number",
    }).positive("price must be a positive number"),

    duration: z.number({
        error: "duration is required and must be a number",
    })
        .int("duration must be an integer")
        .positive("duration should be in days"),

    features: z.array(
        z.string({
            error: "features should be of string",
        })
    )
        .min(1, "features must have at least one item"),
});

export const subscribeUserSchema = z.object({
    planId: z.string({
        error: "Plan Id is required and must be a string",
    }),

    method: z.enum(["wallet"], {
        error: "Payment method is required or invalid",
    }),
});
