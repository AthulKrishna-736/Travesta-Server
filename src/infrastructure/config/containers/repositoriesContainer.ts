import { container } from "tsyringe";
import { TOKENS } from "../../../constants/token";

import { UserRepository } from "../../database/repositories/userRepo";
import { HotelRepository } from "../../database/repositories/hotelRepo";
import { RoomRepository } from "../../database/repositories/roomRepo";
import { BookingRepository } from "../../database/repositories/bookingRepo";
import { AmenitiesRepository } from "../../database/repositories/amenitiesRepo";
import { SusbcriptionRepository } from "../../database/repositories/subscriptionRepo";
import { ChatRepository } from "../../database/repositories/chatRepo";
import { WalletRepository } from "../../database/repositories/walletRepo";
import { TransactionRepository } from "../../database/repositories/transactionRepo";
import { RatingRepository } from "../../database/repositories/ratingRepo";
import { SubscriptionHistoryRepository } from "../../database/repositories/planHistoryRepo";
import { CouponRepository } from "../../database/repositories/couponRepo";
import { OfferRepository } from "../../database/repositories/offerRepo";
import { NotificationRepository } from "../../database/repositories/notificationRepo";

import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { IHotelRepository } from "../../../domain/interfaces/repositories/hotelRepo.interface";
import { IRoomRepository } from "../../../domain/interfaces/repositories/roomRepo.interface";
import { IBookingRepository } from "../../../domain/interfaces/repositories/bookingRepo.interface";
import { IAmenitiesRepository } from "../../../domain/interfaces/repositories/amenitiesRepo.interface";
import { ISubscriptionHistoryRepository, ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { IChatRepository } from "../../../domain/interfaces/repositories/chatRepo.interface";
import { IWalletRepository } from "../../../domain/interfaces/repositories/walletRepo.interface";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/transactionRepo.interface";
import { IRatingRepository } from "../../../domain/interfaces/repositories/ratingRepo.interface";
import { ICouponRepository } from "../../../domain/interfaces/repositories/couponRepo.interface";
import { IOfferRepository } from "../../../domain/interfaces/repositories/offerRepo.interface";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";


container.register<IUserRepository>(TOKENS.UserRepository, {
    useClass: UserRepository,
});

container.register<IHotelRepository>(TOKENS.HotelRepository, {
    useClass: HotelRepository,
})

container.register<IRoomRepository>(TOKENS.RoomRepository, {
    useClass: RoomRepository,
})

container.register<IBookingRepository>(TOKENS.BookingRepository, {
    useClass: BookingRepository
})

container.register<IAmenitiesRepository>(TOKENS.AmenitiesRepository, {
    useClass: AmenitiesRepository,
})

container.register<ISubscriptionRepository>(TOKENS.SubscriptionRepository, {
    useClass: SusbcriptionRepository,
})

container.register<IChatRepository>(TOKENS.ChatRepository, {
    useClass: ChatRepository,
})

container.register<IWalletRepository>(TOKENS.WalletRepository, {
    useClass: WalletRepository,
})

container.register<ITransactionRepository>(TOKENS.TransactionRepository, {
    useClass: TransactionRepository,
})

container.register<ISubscriptionHistoryRepository>(TOKENS.SubscriptionHistoryRepository, {
    useClass: SubscriptionHistoryRepository,
})

container.register<IRatingRepository>(TOKENS.RatingRepository, {
    useClass: RatingRepository,
})

container.register<ICouponRepository>(TOKENS.CouponRepository, {
    useClass: CouponRepository,
})

container.register<IOfferRepository>(TOKENS.OfferRepository, {
    useClass: OfferRepository,
})

container.register<INotificationRepository>(TOKENS.NotificationRepository, {
    useClass: NotificationRepository,
})

