import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { ITransactionRepository, IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { IBookingTransactionUseCase, TCreateTransaction, TResponseTransactions } from '../../../../domain/interfaces/model/wallet.interface';
import { IBooking, ICreateBookingUseCase, TCreateBookingData } from '../../../../domain/interfaces/model/booking.interface';
import mongoose from 'mongoose';


@injectable()
export class BookingTransactionUseCase implements IBookingTransactionUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.CreateBookingUseCase) private _bookingUsecase: ICreateBookingUseCase,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
    ) { }

    async bookingTransaction(vendorId: string, bookingData: TCreateBookingData, method: 'online' | 'wallet'): Promise<{ transaction: TResponseTransactions, message: string }> {
        const [userWallet, vendorWallet] = await Promise.all([
            this._walletRepository.findUserWallet(bookingData.userId.toString()),
            this._walletRepository.findUserWallet(vendorId),
        ]);
        if (!userWallet || !vendorWallet) {
            throw new AppError('Wallet not found', HttpStatusCode.NOT_FOUND);
        }
        if (method === 'wallet' && userWallet.balance < bookingData.totalPrice) {
            throw new AppError('Insufficient wallet balance', HttpStatusCode.BAD_REQUEST);
        }

        const finalBookingData: Omit<IBooking, 'createdAt' | 'updatedAt'> = {
            ...bookingData,
            status: 'confirmed',
            payment: 'success',
        }
        const { booking } = await this._bookingUsecase.createBooking(finalBookingData);
        if (!booking) {
            throw new AppError('Error while booking.Please try again.', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const relatedEntityId = new mongoose.Types.ObjectId(booking._id);
        const description = `Payment for booking #${booking._id}`;
        const transactionId = '';

        // Debit user
        const debitTransaction: TCreateTransaction = {
            walletId: userWallet.id,
            type: 'debit',
            amount: booking.totalPrice,
            description: description.trim(),
            transactionId,
            relatedEntityType: 'Booking',
            relatedEntityId
        };

        // Credit vendor
        const creditTransaction: TCreateTransaction = {
            walletId: vendorWallet.id,
            type: 'credit',
            amount: booking.totalPrice,
            description: description.trim(),
            transactionId,
            relatedEntityType: 'Booking',
            relatedEntityId
        };

        let transaction: TResponseTransactions | null = null;

        if (method === 'online') {
            await this._walletRepository.updateBalance(vendorWallet.id.toString(), booking.totalPrice);

            await this._transactionRepository.createTransaction(debitTransaction);
            transaction = await this._transactionRepository.createTransaction(creditTransaction);
        } else if (method === 'wallet') {
            await this._walletRepository.updateBalance(userWallet.id.toString(), -booking.totalPrice);
            await this._walletRepository.updateBalance(vendorWallet.id.toString(), booking.totalPrice);

            await this._transactionRepository.createTransaction(debitTransaction);
            transaction = await this._transactionRepository.createTransaction(creditTransaction);
        }
        if (!transaction) {
            throw new AppError('Transaction failed', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        return {
            transaction,
            message: `Your booking of ₹${booking.totalPrice} was successfully processed via ${method}.`
        };
    }
}
