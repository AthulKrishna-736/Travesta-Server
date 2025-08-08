import { inject, injectable } from "tsyringe";
import { ITransferUsersAmountUseCase } from "../../../../domain/interfaces/model/wallet.interface";
import { TOKENS } from "../../../../constants/token";
import { IBookingRepository, IWalletRepository } from "../../../../domain/interfaces/repositories/repository.interface";
import { AppError } from "../../../../utils/appError";
import { HttpStatusCode } from "../../../../utils/HttpStatusCodes";

@injectable()
export class TransferUsersAmountUseCase implements ITransferUsersAmountUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository,
        @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository,
    ) { }

    async transferUsersAmount(senderId: string, receiverId: string, amount: number, transactionId: string, relatedBookingId: string, description: string): Promise<void> {

        if (amount <= 0 || isNaN(amount)) {
            throw new AppError('Amount must be a valid positive number', HttpStatusCode.BAD_REQUEST);
        }

        if (!transactionId.trim() || !description.trim() || !relatedBookingId.trim()) {
            throw new AppError('Transaction details are invalid', HttpStatusCode.BAD_REQUEST);
        }

        const [senderWallet, receiverWallet] = await Promise.all([
            this._walletRepo.findWallet(senderId),
            this._walletRepo.findWallet(receiverId)
        ]);

        if (!senderWallet) {
            throw new AppError('Sender wallet not found', HttpStatusCode.NOT_FOUND);
        }

        if (!receiverWallet) {
            throw new AppError('Receiver wallet not found', HttpStatusCode.NOT_FOUND);
        }

        if (senderWallet.balance < amount) {
            throw new AppError('Insufficient balance', HttpStatusCode.CONFLICT);
        }

        senderWallet.balance -= amount;
        senderWallet.transactions.push({
            type: 'debit',
            amount,
            transactionId,
            relatedBookingId,
            description: `Sent to user ${receiverId}: ${description}`,
            date: new Date(),
        });

        receiverWallet.balance += amount;
        receiverWallet.transactions.push({
            type: 'credit',
            amount,
            transactionId,
            relatedBookingId,
            description: `Received from user ${senderId}: ${description}`,
            date: new Date(),
        });

        await Promise.all([
            senderWallet.save(),
            receiverWallet.save()
        ]);

        await this._bookingRepo.confirmBookingPayment(relatedBookingId);
    }
}
