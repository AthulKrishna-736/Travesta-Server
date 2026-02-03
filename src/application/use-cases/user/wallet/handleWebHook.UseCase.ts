import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../../constants/token";
import { IStripeService } from "../../../../domain/interfaces/services/stripeService.interface";
import { IAddMoneyToWalletUseCase, IBookingTransactionUseCase, IHandleStripeWebhookUseCase } from "../../../../domain/interfaces/model/wallet.interface";
import { ISubscribePlanUseCase } from "../../../../domain/interfaces/model/subscription.interface";
import Stripe from "stripe";

@injectable()
export class HandleStripeWebhookUseCase implements IHandleStripeWebhookUseCase {
    constructor(
        @inject(TOKENS.AddMoneyToWalletUseCase) private _addMoneyUseCase: IAddMoneyToWalletUseCase,
        @inject(TOKENS.BookingTransactionUseCase) private _bookingUseCase: IBookingTransactionUseCase,
        @inject(TOKENS.SubscribePlanUseCase) private _subscriptionUseCase: ISubscribePlanUseCase,
    ) { }

    async execute(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const pi = event.data.object as Stripe.PaymentIntent;
                const { purpose, userId, refId } = pi.metadata;

                if (!purpose || !userId) return;

                switch (purpose) {
                    case 'wallet':
                        await this._addMoneyUseCase.addMoneyToWallet(userId, pi.amount_received / 100);
                        console.log('payment verified for add money');
                        break;

                    case 'booking':
                        // await this._bookingUseCase.bookingTransaction(userId, refId!);
                        break;

                    case 'subscription':
                        await this._subscriptionUseCase.subscribePlan(userId, refId!, 'online');
                        console.log('payment verified for the subscription');
                        break;
                }
                break;
            }
        }
    }
}
