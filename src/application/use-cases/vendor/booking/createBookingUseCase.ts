// createBookingUseCase.ts
import { inject, injectable } from 'tsyringe';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../utils/HttpStatusCodes';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository, IWalletRepository } from '../../../../domain/interfaces/repositories/repository.interface';
import { formatDateString } from '../../../../utils/dateFormatter';
import { ICreateBookingUseCase, TCreateBookingData, TResponseBookingData } from '../../../../domain/interfaces/model/booking.interface';

@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
    constructor(
        @inject(TOKENS.BookingRepository) private _bookingRepo: IBookingRepository,
        @inject(TOKENS.WalletRepository) private _walletRepo: IWalletRepository,
    ) { }

    async execute(data: TCreateBookingData): Promise<{ booking: TResponseBookingData; message: string }> {
        const isAvailable = await this._bookingRepo.isRoomAvailable(data.roomId as string, data.checkIn, data.checkOut);
        const { wallet } = await this._walletRepo.findUserWallet(data.userId as string, 1, 10);

        if (!isAvailable) {
            throw new AppError('Room is not available for selected dates', HttpStatusCode.BAD_REQUEST);
        }

        if (new Date(data.checkIn) < new Date()) {
            throw new AppError('Check-in date cannot be in the past', HttpStatusCode.BAD_REQUEST);
        }

        if (new Date(data.checkIn) >= new Date(data.checkOut)) {
            throw new AppError('Check-in date must be before check-out date', HttpStatusCode.BAD_REQUEST);
        }

        if (!wallet) {
            throw new AppError('User does not have a wallet to proceed with booking', HttpStatusCode.NOT_FOUND);
        }

        if (wallet.balance < data.totalPrice) {
            throw new AppError('Insufficient wallet balance to proceed with booking', HttpStatusCode.BAD_REQUEST);
        }

        const created = await this._bookingRepo.createBooking(data);
        if (!created) {
            throw new AppError('Failed to create booking', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedBook: TResponseBookingData = {
            ...created,
            checkIn: formatDateString(created.checkIn.toString()),
            checkOut: formatDateString(created.checkOut.toString()),
        };


        return {
            booking: mappedBook,
            message: 'Booking created successfully',
        };
    }
}
