import mongoose, { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { ISubscribePlanUseCase } from "../../../domain/interfaces/model/subscription.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { IWalletRepository } from "../../../domain/interfaces/repositories/walletRepo.interface";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transactionRepo.interface";
import { ISubscriptionHistoryRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { SubscriptionEntity } from "../../../domain/entities/admin/subscription.entity";
import { SUBSCRIPTION_ERROR_MESSAGES, WALLET_ERROR_MESSAGES } from "../../../constants/errorMessages";

@injectable()
export class SubscribePlanUseCase implements ISubscribePlanUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
        @inject(TOKENS.SubscriptionHistoryRepository) private _historyRepository: ISubscriptionHistoryRepository,
    ) { }

    async subscribePlan(userId: string, planId: string, method: "wallet" | "online"): Promise<{ message: string }> {
        // 1️⃣ Get user
        const user = await this._userRepository.findUserById(userId);
        if (!user) throw new AppError("User not found", HttpStatusCode.NOT_FOUND);

        // 2️⃣ Get subscription plan
        const plan = await this._subscriptionRepo.findPlanById(planId);
        if (!plan) throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        const subscription = new SubscriptionEntity(plan);
        if (!subscription.isActive) throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.notActive, HttpStatusCode.CONFLICT);

        // 3️⃣ Calculate subscription validity
        const validFrom = new Date();
        const validUntil = new Date(validFrom);
        validUntil.setDate(validFrom.getDate() + subscription.duration);

        const userWallet = await this._walletRepository.findUserWallet(user._id!);
        if (!userWallet) throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

        // 4️⃣ Wallet payment check
        if (method === "wallet") {
            const wallet = await this._walletRepository.findUserWallet(userId);
            if (!wallet || wallet.balance < subscription.price) {
                throw new AppError("Insufficient wallet balance", HttpStatusCode.BAD_REQUEST);
            }
            await this._walletRepository.updateBalance(userId, -subscription.price);
        }

        // 5️⃣ Update user subscription
        user.subscription = {
            plan: plan._id.toString(),
            validFrom,
            validUntil,
        };
        const updatedUser = await this._userRepository.subscribeUser(user._id as string, { subscription: user.subscription });
        if (!updatedUser) throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);

        await this._historyRepository.createHistory({
            userId: user._id,
            subscriptionId: plan._id as Types.ObjectId,
            subscribedAt: new Date(),
            validFrom,
            validUntil,
            isActive: true,
            paymentAmount: subscription.price,
        });

        // 7️⃣ Create transaction record
        await this._transactionRepository.createTransaction({
            walletId: new mongoose.Types.ObjectId(userWallet._id!),
            type: "debit",
            amount: subscription.price,
            description: `Payment for subscription ${plan.name}`,
            relatedEntityId: plan._id as Types.ObjectId,
            relatedEntityType: "Subscription",
            transactionId: new mongoose.Types.ObjectId().toString(),
        });

        return {
            message: `User successfully subscribed to ${plan.name} plan`,
        };
    }
}
