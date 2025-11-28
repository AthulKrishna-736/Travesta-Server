import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IBookingRepository } from '../../../../domain/interfaces/repositories/bookingRepo.interface';
import { formatDateString } from '../../../../utils/helperFunctions';
import { IGetBookingsByUserUseCase, TResponseBookingData } from '../../../../domain/interfaces/model/booking.interface';
import { IRedisService } from '../../../../domain/interfaces/services/redisService.interface';
import { IAwsS3Service } from '../../../../domain/interfaces/services/awsS3Service.interface';
import { awsS3Timer } from '../../../../infrastructure/config/jwtConfig';

@injectable()
export class GetBookingsByUserUseCase implements IGetBookingsByUserUseCase {
  constructor(
    @inject(TOKENS.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TOKENS.RedisService) private _redisService: IRedisService,
    @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
  ) { }

  async getBookingByUser(userId: string, page: number, limit: number, search?: string, sort?: string): Promise<{ bookings: TResponseBookingData[], total: number }> {
    const { bookings, total } = await this._bookingRepository.findBookingsByUser(userId, page, limit, search, sort);

    const mappedBookings = await Promise.all(
      bookings.map(async (b) => {

        let signedImageUrls;
        const hotelId = (b.hotelId as any)?._id?.toString();
        if (hotelId) {
          signedImageUrls = await this._redisService.getHotelImageUrls(hotelId);
          if (!signedImageUrls) {
            const imageKeys = Array.isArray((b.hotelId as any).images) ? (b.hotelId as any).images : [];
            signedImageUrls = await Promise.all(
              imageKeys.map((key: string) => this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt))
            );
            await this._redisService.storeHotelImageUrls(hotelId, signedImageUrls, awsS3Timer.expiresAt);
          }
        }

        return {
          ...b,
          checkIn: formatDateString(b.checkIn.toString()),
          checkOut: formatDateString(b.checkOut.toString()),
          hotelId: {
            ...(b.hotelId as any),
            images: signedImageUrls,
          },
        };
      })
    );

    return {
      bookings: mappedBookings,
      total,
    };
  }
}
