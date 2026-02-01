import { injectable } from 'tsyringe';
import Stripe from 'stripe';
import { env } from '../config/env';
import { IStripeService } from '../../domain/interfaces/services/stripeService.interface';

const stripe = new Stripe(env.STRIPE_SECRET);

@injectable()
export class StripeService implements IStripeService {

    async createPaymentIntent(userId: string, amount: number, purpose: 'wallet' | 'booking' | 'subscription', refId?: string): Promise<{ clientSecret: string }> {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'inr',
            metadata: {
                purpose,
                userId,
                refId: refId ?? '',
            },
            automatic_payment_methods: { enabled: true },
        });

        return { clientSecret: paymentIntent.client_secret! };
    }
}
