
export interface IStripeService {
    createPaymentIntent(userId: string, amount: number): Promise<{ clientSecret: string }>;
}