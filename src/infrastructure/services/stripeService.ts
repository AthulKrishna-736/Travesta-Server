import { injectable } from 'tsyringe';
import Stripe from 'stripe';
import { env } from '../config/env';
import { IStripeService } from '../../domain/interfaces/services/stripeService.interface';


@injectable()
export class StripeService implements IStripeService {
    private _stripe: Stripe;

    constructor() {
        this._stripe = new Stripe(env.STRIPE_SECRET);
    }

    async createPaymentIntent(userId: string, amount: number, purpose: 'wallet' | 'booking' | 'subscription', refId?: string): Promise<{ clientSecret: string }> {
        const paymentIntent = await this._stripe.paymentIntents.create({
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

    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
        if (!env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('Stripe webhook secret missing');
        }

        const event = this._stripe.webhooks.constructEvent(
            payload,
            signature,
            env.STRIPE_WEBHOOK_SECRET
        );

        return event;
    }
}
