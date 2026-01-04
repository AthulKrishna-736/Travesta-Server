import { injectable } from 'tsyringe';
import Stripe from 'stripe';
import { env } from '../config/env';
import { IStripeService } from '../../domain/interfaces/services/stripeService.interface';

const stripe = new Stripe(env.STRIPE_SECRET, {
    apiVersion: '2025-08-27.basil'
});

@injectable()
export class StripeService implements IStripeService {

    async createPaymentIntent(userId: string, amount: number): Promise<{ clientSecret: string }> {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'inr',
            metadata: { userId },
            automatic_payment_methods: { enabled: true },
        });

        return { clientSecret: paymentIntent.client_secret! };
    }
}
