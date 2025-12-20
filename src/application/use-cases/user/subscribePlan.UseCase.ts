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
import { AUTH_ERROR_MESSAGES, SUBSCRIPTION_ERROR_MESSAGES, WALLET_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { nanoid } from "nanoid";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";

@injectable()
export class SubscribePlanUseCase implements ISubscribePlanUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
        @inject(TOKENS.SubscriptionHistoryRepository) private _historyRepository: ISubscriptionHistoryRepository,
        @inject(TOKENS.NotificationRepository) private _notificationRepository: INotificationRepository,
    ) { }

    async subscribePlan(userId: string, planId: string, method: "wallet" | "online"): Promise<{ message: string }> {

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) throw new AppError(AUTH_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

            const plan = await this._subscriptionRepository.findPlanById(planId);
            if (!plan) throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

            if (!plan.isActive) throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.notActive, HttpStatusCode.CONFLICT);

            const validFrom = new Date();
            const validUntil = new Date(validFrom);
            validUntil.setDate(validFrom.getDate() + plan.duration);

            const userWallet = await this._walletRepository.findUserWallet(user._id as string);
            const adminWallet = await this._walletRepository.findAdminWallet();
            if (!userWallet) throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
            if (!adminWallet) throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);

            if (method === "wallet") {
                if (!userWallet || userWallet.balance < plan.price) {
                    throw new AppError(WALLET_ERROR_MESSAGES.Insufficient, HttpStatusCode.BAD_REQUEST);
                }
                await this._walletRepository.updateBalance(userId, -plan.price, session);
            }

            await this._historyRepository.deactivateActiveByUserId(user._id as string, session);

            const planHistory = await this._historyRepository.createHistory({
                userId: user._id,
                subscriptionId: plan._id as Types.ObjectId,
                subscribedAt: new Date(),
                validFrom,
                validUntil,
                isActive: true,
                paymentAmount: plan.price,
            }, session);

            if (!planHistory) throw new AppError('Failed to create Subscription history', HttpStatusCode.INTERNAL_SERVER_ERROR);

            const updatedUser = await this._userRepository.subscribeUser(user._id as string, { subscription: planHistory._id }, session);
            if (!updatedUser) throw new AppError(SUBSCRIPTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);

            await this._transactionRepository.createTransaction({
                walletId: new mongoose.Types.ObjectId(userWallet._id),
                type: "debit",
                amount: plan.price,
                description: `Payment for subscription ${plan.name}`,
                relatedEntityId: plan._id as Types.ObjectId,
                relatedEntityType: "Subscription",
                transactionId: `TRN-${nanoid(10)}`,
            }, session);

            await this._walletRepository.updateBalance(adminWallet.userId.toString(), plan.price, session);

            await this._transactionRepository.createTransaction({
                walletId: new mongoose.Types.ObjectId(adminWallet._id),
                type: "credit",
                amount: plan.price,
                description: `Received payment from ${user.firstName} ${user.lastName} for subscription ${plan.name}`,
                relatedEntityId: plan._id as Types.ObjectId,
                relatedEntityType: "Subscription",
                transactionId: `TRN-${nanoid(10)}`,
            }, session);

            await this._notificationRepository.createNotification(
                {
                    userId: userWallet.userId.toString(),
                    title: "Subscription Activated",
                    message: `You have successfully subscribed to the ${plan.name} plan. Valid until ${validUntil.toDateString()}.`,
                },
                session
            );

            await this._notificationRepository.createNotification(
                {
                    userId: adminWallet.userId.toString(),
                    title: "New Subscription",
                    message: `${user.firstName} ${user.lastName} subscribed to the ${plan.name} plan for ₹${plan.price}.`,
                },
                session
            );

            await session.commitTransaction();

            return {
                message: `User successfully subscribed to ${plan.name} plan`,
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
