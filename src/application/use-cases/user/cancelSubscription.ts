import mongoose from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { ICancelSubscriptionUseCase } from "../../../domain/interfaces/model/subscription.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IWalletRepository } from "../../../domain/interfaces/repositories/walletRepo.interface";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transactionRepo.interface";
import { ISubscriptionHistoryRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { SUBSCRIPTION_ERROR_MESSAGES, WALLET_ERROR_MESSAGES, AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";

@injectable()
export class CancelSubscriptionUseCase implements ICancelSubscriptionUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
        @inject(TOKENS.SubscriptionHistoryRepository) private _historyRepository: ISubscriptionHistoryRepository,
    ) { }

    async cancelSubscription(userId: string): Promise<{ message: string }> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

            const activeSubscription = await this._historyRepository.findActiveByUserId(userId);
            if (!activeSubscription) {
                throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.noActivePlans, HttpStatusCode.BAD_REQUEST);
            }

            const refundAmount = activeSubscription.paymentAmount || 0;

            const userWallet = await this._walletRepository.findUserWallet(userId);
            const adminWallet = await this._walletRepository.findAdminWallet();

            if (!userWallet || !adminWallet) {
                throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
            }

            if (refundAmount > 0) {
                // Refund to user
                await this._walletRepository.updateBalance(userId, refundAmount, session);
                await this._walletRepository.updateBalance(adminWallet.userId.toString(), -refundAmount, session);

                // Transactions
                await this._transactionRepository.createTransaction({
                    walletId: new mongoose.Types.ObjectId(userWallet._id),
                    type: "credit",
                    amount: refundAmount,
                    description: `Refund for subscription cancellation`,
                    relatedEntityId: new mongoose.Types.ObjectId(activeSubscription.subscriptionId),
                    relatedEntityType: "Subscription",
                    transactionId: new mongoose.Types.ObjectId().toString(),
                }, session);

                await this._transactionRepository.createTransaction({
                    walletId: new mongoose.Types.ObjectId(adminWallet._id),
                    type: "debit",
                    amount: refundAmount,
                    description: `Refunded user ${user.firstName} ${user.lastName} for subscription cancellation`,
                    relatedEntityId: new mongoose.Types.ObjectId(activeSubscription.subscriptionId),
                    relatedEntityType: "Subscription",
                    transactionId: new mongoose.Types.ObjectId().toString(),
                }, session);
            }

            // Deactivate subscription
            await this._historyRepository.deactivateActiveByUserId(userId, session);

            // Remove subscription from user (optional)
            await this._userRepository.subscribeUser(userId, { subscription: null }, session);

            await session.commitTransaction();

            return { message: "Active subscription successfully canceled and refunded" };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
