import z from "zod";

export const subscriptionSchema = z.object({
    name: z.string({
        required_error: 'name is required',
        invalid_type_error: 'name must be string',
    })
        .min(3, 'name must be at least 3 characters'),

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


export const subscribeUserSchema = z.object({
    planId: z.string({
        required_error: 'Plan Id is required',
        invalid_type_error: 'Plan Id must be string',
    }),
    method: z.enum(['wallet'], {
        invalid_type_error: 'Invalid payment method',
        required_error: 'Payment method is required'
    })
})