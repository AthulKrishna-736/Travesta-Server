import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { ITransactionRepository } from '../../../../domain/interfaces/repositories/transactionRepo.interface';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/walletRepo.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { IBookingTransactionUseCase, TCreateTransaction, TResponseTransactions } from '../../../../domain/interfaces/model/wallet.interface';
import { IBooking, ICreateBookingUseCase, TCreateBookingData } from '../../../../domain/interfaces/model/booking.interface';
import mongoose from 'mongoose';
import { BOOKING_ERROR_MESSAGES, TRANSACTION_ERROR_MESSAGES, WALLET_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { ResponseMapper } from '../../../../utils/responseMapper';
import { TResponseTransactionDTO } from '../../../../interfaceAdapters/dtos/transactions.dto';


@injectable()
export class BookingTransactionUseCase implements IBookingTransactionUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository,
        @inject(TOKENS.CreateBookingUseCase) private _bookingUsecase: ICreateBookingUseCase,
        @inject(TOKENS.TransactionRepository) private _transactionRepository: ITransactionRepository,
    ) { }

    async bookingTransaction(vendorId: string, bookingData: TCreateBookingData, method: 'online' | 'wallet'): Promise<{ transaction: TResponseTransactionDTO, message: string }> {
        const [userWallet, vendorWallet] = await Promise.all([
            this._walletRepository.findUserWallet(bookingData.userId.toString()),
            this._walletRepository.findUserWallet(vendorId.toString()),
        ]);
        if (!userWallet || !vendorWallet) {
            throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }
        if (method === 'wallet' && userWallet.balance < bookingData.totalPrice) {
            throw new AppError(WALLET_ERROR_MESSAGES.Insufficient, HttpStatusCode.BAD_REQUEST);
        }

        const finalBookingData: Omit<IBooking, 'createdAt' | 'updatedAt'> = {
            ...bookingData,
            status: 'confirmed',
            payment: 'success',
        }
        const { booking } = await this._bookingUsecase.createBooking(finalBookingData);
        if (!booking) {
            throw new AppError(BOOKING_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
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
            throw new AppError(TRANSACTION_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedTransaction = ResponseMapper.mapTransactionToResponseDTO(transaction);
        return {
            transaction: mappedTransaction,
            message: `Your booking of ₹${booking.totalPrice} was successfully processed via ${method}.`
        };
    }
}
