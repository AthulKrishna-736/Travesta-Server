
export interface IStripeService {
    createPaymentIntent(userId: string, amount: number, purpose: 'wallet' | 'booking' | 'subscription', refId?: string): Promise<{ clientSecret: string }>;
}