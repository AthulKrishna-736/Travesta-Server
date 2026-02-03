import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/bookingRepo.interface';
import { IGetBookingsByUserUseCase } from '../../../../domain/interfaces/model/booking.interface';
import { IAwsS3Service } from '../../../../domain/interfaces/services/awsS3Service.interface';
import { awsS3Timer } from '../../../../infrastructure/config/jwtConfig';
import { TResponseBookingDTO } from '../../../../interfaceAdapters/dtos/booking.dto';
import { ResponseMapper } from '../../../../utils/responseMapper';


@injectable()
export class GetBookingsByUserUseCase implements IGetBookingsByUserUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
  ) { }

  async getBookingByUser(userId: string, page: number, limit: number, search?: string, sort?: string): Promise<{ bookings: TResponseBookingDTO[], total: number, message: string }> {
    const { bookings, total } = await this._bookingRepository.findBookingsByUser(userId, page, limit, search, sort);

    if (!bookings || bookings.length == 0 || total == 0) {
      return {
        bookings: [],
        total: 0,
        message: 'User have no bookings',
      }
    }

    const enrichedBookings = await Promise.all(
      bookings.map(async (b) => {

        if (b.hotel.images && b.hotel.images.length > 0) {
          b.hotel.images = await Promise.all(b.hotel.images.map(key => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)))
        }

        return b;
      })
    );

    const mappedBookings = enrichedBookings.map(ResponseMapper.mapBookingResponseToDTO);

    return {
      bookings: mappedBookings,
      total,
      message: 'Feched user bookings successfully'
    };
  }
}
