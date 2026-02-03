import Stripe from "stripe";

export interface IStripeService {
    createPaymentIntent(userId: string, amount: number, purpose: 'wallet' | 'booking' | 'subscription', refId?: string): Promise<{ clientSecret: string }>;
    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event
}