import { container } from "tsyringe";
import { TOKENS } from "../../constants/token";

// Repository Imports
import { UserRepository } from "../database/repositories/userRepo";
import { HotelRepository } from "../database/repositories/hotelRepo";
import { RoomRepository } from "../database/repositories/roomRepo";
import { BookingRepository } from "../database/repositories/bookingRepo";
import { AmenitiesRepository } from "../database/repositories/amenitiesRepo";
import { SusbcriptionRepository } from "../database/repositories/subscription.Repo";
import { ChatRepository } from "../database/repositories/chatRepo";
import { WalletRepository } from "../database/repositories/wallet.Repo";
import { TransactionRepository } from "../database/repositories/transactionRepo";
import { RatingRepository } from "../database/repositories/ratingRepo";
import { SubscriptionHistoryRepository } from "../database/repositories/planHistoryRepo";
import { CouponRepository } from "../database/repositories/couponRepo";
import { OfferRepository } from "../database/repositories/offerRepo";

import { IUserRepository } from "../../domain/interfaces/repositories/userRepo.interface";
import { IHotelRepository } from "../../domain/interfaces/repositories/hotelRepo.interface";
import { IRoomRepository } from "../../domain/interfaces/repositories/roomRepo.interface";
import { IBookingRepository } from "../../domain/interfaces/repositories/bookingRepo.interface";
import { IAmenitiesRepository } from "../../domain/interfaces/repositories/amenitiesRepo.interface";
import { ISubscriptionHistoryRepository, ISubscriptionRepository } from "../../domain/interfaces/repositories/subscriptionRepo.interface";
import { IChatRepository } from "../../domain/interfaces/repositories/chatRepo.interface";
import { IWalletRepository } from "../../domain/interfaces/repositories/walletRepo.interface";
import { ITransactionRepository } from "../../domain/interfaces/repositories/transactionRepo.interface";
import { IRatingRepository } from "../../domain/interfaces/repositories/ratingRepo.interface";
import { ICouponRepository } from "../../domain/interfaces/repositories/couponRepo.interface";
import { IOfferRepository } from "../../domain/interfaces/repositories/offerRepo.interface";

// Services Imports
import { AuthService } from "../services/authService";
import { MailService } from "../services/mailService";
import { RedisService } from "../services/redisService"
import { AwsS3Service } from "../services/awsS3Service";
import { SocketService } from "../services/socketService";
import { StripeService } from "../services/stripeService";

import { IAuthService } from "../../domain/interfaces/services/authService.interface";
import { IAwsS3Service } from "../../domain/interfaces/services/awsS3Service.interface";
import { IMailService } from "../../domain/interfaces/services/mailService.interface";
import { IRedisService } from "../../domain/interfaces/services/redisService.interface";


// Auth UseCase Imports
import { LoginUseCase } from "../../application/use-cases/auth/loginUseCase";
import { RegisterUseCase } from "../../application/use-cases/auth/registerUseCase";
import { ConfirmRegisterUseCase } from "../../application/use-cases/auth/confirmRegisterUseCase";
import { GoogleLoginUseCase } from "../../application/use-cases/auth/googleLoginUseCase";
import { ForgotPassUseCase } from "../../application/use-cases/auth/forgotPassUseCase";
import { ResetPassUseCase } from "../../application/use-cases/auth/resetPassUseCase";
import { ResendOtpUseCase } from "../../application/use-cases/auth/resendOtpUseCase";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/verifyOtpUseCase";
import { LogoutUseCase } from "../../application/use-cases/auth/logoutUseCase";

import {
  IConfrimRegisterUseCase,
  IForgotPassUseCase,
  IGoogleLoginUseCase,
  ILoginUseCase,
  ILogoutUseCases,
  IRegisterUseCase,
  IResendOtpUseCase,
  IResetPassUseCase,
  IVerifyOtpUseCase
} from "../../domain/interfaces/model/auth.interface";


// Hotel UseCase Imports
import { CreateHotelUseCase } from "../../application/use-cases/vendor/hotel/createHotelUseCase";
import { UpdateHotelUseCase } from "../../application/use-cases/vendor/hotel/updateHotelUseCase";
import { GetHotelByIdUseCase } from "../../application/use-cases/vendor/hotel/getHotelUseCase";
import { GetAllHotelsUseCase } from "../../application/use-cases/vendor/hotel/getAllHotelsUseCase";
import { GetRoomsByHotelUseCase } from "../../application/use-cases/vendor/room/getRoomByHotelUseCase";
import { GetBookingsByHotelUseCase } from "../../application/use-cases/vendor/booking/getBookingHotelUseCase";
import { GetVendorHotelsUseCase } from "../../application/use-cases/vendor/hotel/getHotelsByVendorUseCase";
import { GetHotelAnalyticsUseCase } from "../../application/use-cases/vendor/hotel/getHotelAnalyticsUseCase";
import { GetVendorHotelAnalyticsUseCase } from "../../application/use-cases/vendor/getVendorHotelAnalyticsUseCase";
import { GetHotelDetailsWithRoomUseCase } from "../../application/use-cases/vendor/hotel/getHotelDetailWithRoomUseCase";
import { GetTrendingHotelsUseCase } from "../../application/use-cases/vendor/hotel/getTrendingHotelsUseCase";

import {
  ICreateHotelUseCase,
  IGetAllHotelsUseCase,
  IGetHotelAnalyticsUseCase,
  IGetHotelByIdUseCase,
  IGetHotelDetailWithRoomUseCase,
  IGetTrendingHotelsUseCase,
  IGetVendorHotelsUseCase,
  IUpdateHotelUseCase
} from "../../domain/interfaces/model/hotel.interface";


// Room UseCase Imports
import { CreateRoomUseCase } from "../../application/use-cases/vendor/room/createRoomUseCase";
import { UpdateRoomUseCase } from "../../application/use-cases/vendor/room/updateRoomUseCase";
import { GetRoomByIdUseCase } from "../../application/use-cases/vendor/room/getRoomByIdUseCase";
import { GetAllRoomsUseCase } from "../../application/use-cases/vendor/room/getAllRoomsUseCase";

import {
  ICreateRoomUseCase,
  IGetAllRoomsUseCase,
  IGetRoomByIdUseCase,
  IGetRoomsByHotelUseCase,
  IUpdateRoomUseCase
} from "../../domain/interfaces/model/room.interface";


// Booking UseCase Imports
import { CreateBookingUseCase } from "../../application/use-cases/vendor/booking/createBookingUseCase";
import { GetBookingsByUserUseCase } from "../../application/use-cases/vendor/booking/getBookingUserUseCase";
import { CancelBookingUseCase } from "../../application/use-cases/vendor/booking/cancelBookingUseCase";
import { GetBookingsToVendorUseCase } from "../../application/use-cases/vendor/booking/getBookingsToVendor";

import {
  ICancelBookingUseCase,
  ICreateBookingUseCase,
  IGetAdminAnalyticsUseCase,
  IGetBookingsByHotelUseCase,
  IGetBookingsByUserUseCase,
  IGetBookingsToVendorUseCase,
  IGetVendorHotelAnalyticsUseCase
} from "../../domain/interfaces/model/booking.interface";


// Amenities UseCase Imports
import { CreateAmenityUseCase } from "../../application/use-cases/amenities/createAmenityUseCase";
import { UpdateAmenityUseCase } from "../../application/use-cases/amenities/updateAmenityUseCase";
import { BlockUnblockAmenity } from "../../application/use-cases/amenities/blockUnblockAmenityUseCase";
import { GetAmenityByIdUseCase } from "../../application/use-cases/amenities/getAmenityByIdUseCase";
import { GetAllAmenitiesUseCase } from "../../application/use-cases/amenities/getAllAmenitiesUseCase";
import { GetActiveAmenitiesUseCase } from "../../application/use-cases/amenities/getActiveAmenitiesUseCase";
import { FindUsedActiveAmenitiesUseCase } from "../../application/use-cases/amenities/getUserActiveAmenitiesUseCase";

import {
  IBlockUnblockAmenityUseCase,
  ICreateAmenityUseCase,
  IFindUsedActiveAmenitiesUseCase,
  IGetActiveAmenitiesUseCase,
  IGetAllAmenitiesUseCase,
  IGetAmenityByIdUseCase,
  IUpdateAmenityUseCase
} from "../../domain/interfaces/model/amenities.interface";


// Chat UseCase Import
import { GetChatMessagesUseCase } from "../../application/use-cases/chat/getChatMsg.UseCase.";
import { SendMessageUseCase } from "../../application/use-cases/chat/sendMsg.UseCase";
import { GetChattedUsersUseCase } from "../../application/use-cases/chat/getChatUsers.UseCase";
import { MarkMsgAsReadUseCase } from "../../application/use-cases/chat/markMsgRead.UseCase";
import { GetVendorsChatWithUserUseCase } from "../../application/use-cases/chat/getVendorsChattedWithUser.UseCase";
import { GetVendorsChatWithAdmiinUseCase } from "../../application/use-cases/chat/getVendorsChattedWithAdmin.UseCase";
import { GetUserUnreadMsgUseCase } from "../../application/use-cases/chat/getUserUnreadMsg.UseCase";
import { GetChatAccessUseCase } from "../../application/use-cases/chat/getChatAccess.UseCase";

import {
  IGetChatAccessUseCase,
  IGetChatMessagesUseCase,
  IGetChattedUsersUseCase,
  IGetUserUnreadMsgUseCase,
  IGetVendorsChatWithAdminUseCase,
  IGetVendorsChatWithUserUseCase,
  IMarkMsgAsReadUseCase,
  ISendMessageUseCase
} from "../../domain/interfaces/model/chat.interface";


// Subscription UseCase Import
import { CreatePlanUseCase } from "../../application/use-cases/subscription/createPlanUseCase";
import { UpdatePlanUseCase } from "../../application/use-cases/subscription/updatePlanUseCase";
import { GetActivePlansUseCase } from "../../application/use-cases/subscription/getActivePlansUseCase";
import { GetAllPlansUseCase } from "../../application/use-cases/subscription/getAllPlansUseCase";
import { BlockUnblockPlanUseCase } from "../../application/use-cases/subscription/blockUnblockPlanUseCase";
import { GetAllPlanHistoryUseCase } from "../../application/use-cases/subscription/getAllPlansHistoryUseCase";
import { GetUserActivePlanUseCase } from "../../application/use-cases/subscription/getUserActivePlanUseCase";
import { CancelSubscriptionUseCase } from "../../application/use-cases/user/cancelSubscription";

import {
  IBlockUnblockPlanUseCase,
  ICancelSubscriptionUseCase,
  ICreatePlanUseCase,
  IGetActivePlansUseCase,
  IGetAllPlanHistoryUseCase,
  IGetAllPlansUseCase,
  IGetUserActivePlanUseCase,
  ISubscribePlanUseCase,
  IUpdatePlanUseCase
} from "../../domain/interfaces/model/subscription.interface";


// Rating & Reviews UseCase Imports
import { CreateRatingUseCase } from "../../application/use-cases/rating/createRatingUseCase";
import { UpdateRatingUseCase } from "../../application/use-cases/rating/updateRatingUseCase";
import { GetRatingUseCase } from "../../application/use-cases/rating/getRatingsUseCase";

import {
  ICreateRatingUseCase,
  IGetRatingUseCase,
  IUpdateRatingUseCase
} from "../../domain/interfaces/model/rating.interface";


// Wallet UseCase Imports
import { GetWalletUseCase } from "../../application/use-cases/user/wallet/getWallet.UseCase";
import { CreateWalletUseCase } from "../../application/use-cases/user/wallet/createWallet.UseCase";
import { BookingTransactionUseCase } from "../../application/use-cases/user/wallet/bookingTransaction.UseCase";
import { AddMoneyToWalletUseCase } from "../../application/use-cases/user/wallet/addMoneyTransaction.UseCase";
import { GetTransactionsUseCase } from "../../application/use-cases/user/wallet/getTransactions.UseCase";

import {
  IAddMoneyToWalletUseCase,
  IBookingTransactionUseCase,
  ICreateWalletUseCase,
  IGetTransactionsUseCase,
  IGetWalletUseCase
} from "../../domain/interfaces/model/wallet.interface";


// Coupon UseCase Imports
import { CreateCouponUseCase } from "../../application/use-cases/coupon/createCouponUseCase";
import { UpdateCouponUseCase } from "../../application/use-cases/coupon/updateCouponUseCase";
import { GetVendorCouponsUseCase } from "../../application/use-cases/coupon/getVendorCouponsUseCase";
import { GetUserCouponsUseCase } from "../../application/use-cases/coupon/getUserCouponsUseCase";
import { ToggleCouponStatusUseCase } from "../../application/use-cases/coupon/toggleCouponStatusUseCase";

import {
  ICreateCouponUseCase,
  IGetUserCouponsUseCase,
  IGetVendorCouponsUseCase,
  IToggleCouponStatusUseCase,
  IUpdateCouponUseCase
} from "../../domain/interfaces/model/coupon.interface";


// Offer UseCase Imports
import { CreateOfferUseCase } from "../../application/use-cases/offer/createOfferUseCase";
import { UpdateOfferUseCase } from "../../application/use-cases/offer/updateOfferUseCase";
import { GetVendorOffersUseCase } from "../../application/use-cases/offer/getVendorOfferUseCase";
import { DetectOfferForRoomUseCase } from "../../application/use-cases/offer/detectOffersForRoomUseCast";
import { ToggleOfferStatusUseCase } from "../../application/use-cases/offer/toggleOfferStatusUseCase";

import {
  ICreateOfferUseCase,
  IDetectOfferForRoomUseCase,
  IGetVendorOffersUseCase,
  IToggleOfferStatusUseCase,
  IUpdateOfferUseCase
} from "../../domain/interfaces/model/offer.interface";


// Admin UseCase Imports
import { BlockUnblockUser } from "../../application/use-cases/admin/blockUser";
import { GetAllUsers } from "../../application/use-cases/admin/getAllUsers";
import { GetAllVendorReq } from "../../application/use-cases/admin/getAllVendorReq";
import { UpdateVendorReq } from "../../application/use-cases/admin/updateVendorReq";

import {
  IBlockUnblockUser,
  IGetAllUsersUseCase,
  IGetAllVendorReqUseCase,
  IGetUserUseCase,
  IGetVendorUseCase,
  IUpdateKycUseCase,
  IUpdateUserUseCase,
  IUpdateVendorReqUseCase
} from "../../domain/interfaces/model/usecases.interface";


// User UseCase Imports
import { UpdateUser } from "../../application/use-cases/common/updateUserProfle";
import { GetUserProfileUseCase } from "../../application/use-cases/user/getUser";
import { SubscribePlanUseCase } from "../../application/use-cases/user/subscribePlan.UseCase";


// Vendor UseCase Imports
import { UpdateKycUseCase } from "../../application/use-cases/vendor/updateKyc";
import { GetVendorProfileUseCase } from "../../application/use-cases/vendor/getVendor";
import { GetAdminAnalyticsUseCase } from "../../application/use-cases/vendor/getAdminAnalyticsUseCase";


// Controllers Importss
import { AuthController } from "../../interfaceAdapters/controllers/authController";
import { UserController } from "../../interfaceAdapters/controllers/userController";
import { VendorController } from "../../interfaceAdapters/controllers/vendorController";
import { AdminController } from "../../interfaceAdapters/controllers/adminController";
import { HotelController } from "../../interfaceAdapters/controllers/hotelController";
import { RoomController } from "../../interfaceAdapters/controllers/roomController";
import { BookingController } from "../../interfaceAdapters/controllers/bookingController";
import { WalletController } from "../../interfaceAdapters/controllers/walletController";
import { ChatController } from "../../interfaceAdapters/controllers/chatController";
import { AmenityController } from "../../interfaceAdapters/controllers/amenityController";
import { RatingController } from "../../interfaceAdapters/controllers/ratingController";
import { CouponController } from "../../interfaceAdapters/controllers/couponController";
import { OfferController } from "../../interfaceAdapters/controllers/offerController";
import { SubscriptionController } from "../../interfaceAdapters/controllers/subscriptionController";

import { IAuthController } from "../../domain/interfaces/controllers/authController.interface";
import { IUserController } from "../../domain/interfaces/controllers/userController.interface";
import { IVendorController } from "../../domain/interfaces/controllers/vendorController.interface";
import { IAdminController } from "../../domain/interfaces/controllers/adminController.interface";
import { IHotelController } from "../../domain/interfaces/controllers/hotelController.interface";
import { IRoomController } from "../../domain/interfaces/controllers/roomController.interface";
import { IBookingController } from "../../domain/interfaces/controllers/bookingController.interface";
import { IWalletController } from "../../domain/interfaces/controllers/walletController.interface";
import { IChatController } from "../../domain/interfaces/controllers/chatController.interface";
import { IAmenityController } from "../../domain/interfaces/controllers/amenityController.interface";
import { IRatingController } from "../../domain/interfaces/controllers/ratingController.interface";
import { ICouponController } from "../../domain/interfaces/controllers/couponController.interface";
import { IOfferController } from "../../domain/interfaces/controllers/offerController.interface";


// repository
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


// controllers
container.register<IAuthController>(TOKENS.AuthController, {
  useClass: AuthController,
});

container.register<IUserController>(TOKENS.UserController, {
  useClass: UserController,
});

container.register<IVendorController>(TOKENS.VendorController, {
  useClass: VendorController,
});

container.register<IAdminController>(TOKENS.AdminController, {
  useClass: AdminController,
});

container.register<IHotelController>(TOKENS.HotelController, {
  useClass: HotelController,
});

container.register<IRoomController>(TOKENS.RoomController, {
  useClass: RoomController,
});

container.register<IBookingController>(TOKENS.BookingController, {
  useClass: BookingController,
});

container.register<IWalletController>(TOKENS.WalletController, {
  useClass: WalletController,
});

container.register<IChatController>(TOKENS.ChatController, {
  useClass: ChatController,
});

container.register<IAmenityController>(TOKENS.AmenityController, {
  useClass: AmenityController,
});

container.register<SubscriptionController>(TOKENS.SubscriptionController, {
  useClass: SubscriptionController,
});

container.register<IRatingController>(TOKENS.RatingController, {
  useClass: RatingController,
})

container.register<ICouponController>(TOKENS.CouponController, {
  useClass: CouponController,
})

container.register<IOfferController>(TOKENS.OfferController, {
  useClass: OfferController,
})


// services
container.register<IAuthService>(TOKENS.AuthService, {
  useClass: AuthService,
});

container.register<IMailService>(TOKENS.MailService, {
  useClass: MailService,
});

container.register<IRedisService>(TOKENS.RedisService, {
  useClass: RedisService,
})

container.register<IAwsS3Service>(TOKENS.AwsS3Service, {
  useClass: AwsS3Service,
})

container.register(TOKENS.SocketService, {
  useClass: SocketService,
})

container.register(TOKENS.StripeService, {
  useClass: StripeService,
})


// common UseCases
container.register<ILoginUseCase>(TOKENS.LoginUseCase, {
  useClass: LoginUseCase,
})

container.register<IRegisterUseCase>(TOKENS.RegisterUseCase, {
  useClass: RegisterUseCase,
})

container.register<IConfrimRegisterUseCase>(TOKENS.ConfirmRegisterUseCase, {
  useClass: ConfirmRegisterUseCase,
})

container.register<IGoogleLoginUseCase>(TOKENS.GoogleLoginUseCase, {
  useClass: GoogleLoginUseCase,
})

container.register<IForgotPassUseCase>(TOKENS.ForgotPassUseCase, {
  useClass: ForgotPassUseCase,
})

container.register<IResetPassUseCase>(TOKENS.ResetPassUseCase, {
  useClass: ResetPassUseCase,
})

container.register<IResendOtpUseCase>(TOKENS.ResendOtpUseCase, {
  useClass: ResendOtpUseCase,
})

container.register<IVerifyOtpUseCase>(TOKENS.VerifyOtpUseCase, {
  useClass: VerifyOtpUseCase,
})

container.register<ILogoutUseCases>(TOKENS.LogoutUseCase, {
  useClass: LogoutUseCase,
})


// admin UseCases
container.register<IBlockUnblockUser>(TOKENS.BlockUserUseCase, {
  useClass: BlockUnblockUser,
})

container.register<IGetAllUsersUseCase>(TOKENS.GetAllUsersUseCase, {
  useClass: GetAllUsers,
})

container.register<IGetAllVendorReqUseCase>(TOKENS.GetAllVendorReqUseCase, {
  useClass: GetAllVendorReq,
})

container.register<IUpdateVendorReqUseCase>(TOKENS.UpdateVendorReqUseCase, {
  useClass: UpdateVendorReq,
})

container.register<IGetAdminAnalyticsUseCase>(TOKENS.GetAdminAnalyticsUseCase, {
  useClass: GetAdminAnalyticsUseCase,
})


// user UseCases
container.register<IUpdateUserUseCase>(TOKENS.UpdateUserUseCase, {
  useClass: UpdateUser,
})

container.register<IGetUserUseCase>(TOKENS.GetUserUseCase, {
  useClass: GetUserProfileUseCase,
})


// vendor UseCases
container.register<IUpdateKycUseCase>(TOKENS.UpdateKycUseCase, {
  useClass: UpdateKycUseCase,
})

container.register<IGetVendorUseCase>(TOKENS.GetVendorUseCase, {
  useClass: GetVendorProfileUseCase,
})


// hotel UseCases
container.register<ICreateHotelUseCase>(TOKENS.CreateHotelUseCase, {
  useClass: CreateHotelUseCase,
})

container.register<IUpdateHotelUseCase>(TOKENS.UpdateHotelUseCase, {
  useClass: UpdateHotelUseCase,
})

container.register<IGetHotelByIdUseCase>(TOKENS.GetHotelByIdUseCase, {
  useClass: GetHotelByIdUseCase,
})

container.register<IGetAllHotelsUseCase>(TOKENS.GetAllHotelsUseCase, {
  useClass: GetAllHotelsUseCase,
})

container.register<IGetVendorHotelsUseCase>(TOKENS.GetHotelsByVendorUseCase, {
  useClass: GetVendorHotelsUseCase,
})

container.register<IGetHotelAnalyticsUseCase>(TOKENS.GetHotelAnalyticsUseCase, {
  useClass: GetHotelAnalyticsUseCase,
})

container.register<IGetHotelDetailWithRoomUseCase>(TOKENS.GetHotelDetailsWithRoomUseCase, {
  useClass: GetHotelDetailsWithRoomUseCase,
})

container.register<IGetTrendingHotelsUseCase>(TOKENS.GetTrendingHotelsUseCase, {
  useClass: GetTrendingHotelsUseCase,
})

// room UseCase
container.register<ICreateRoomUseCase>(TOKENS.CreateRoomUseCase, {
  useClass: CreateRoomUseCase,
})

container.register<IUpdateRoomUseCase>(TOKENS.UpdateRoomUseCase, {
  useClass: UpdateRoomUseCase,
})

container.register<IGetRoomByIdUseCase>(TOKENS.GetRoomByIdUseCase, {
  useClass: GetRoomByIdUseCase,
})

container.register<IGetRoomsByHotelUseCase>(TOKENS.GetRoomsByHotelUseCase, {
  useClass: GetRoomsByHotelUseCase,
})

container.register<IGetAllRoomsUseCase>(TOKENS.GetAllRoomsUseCase, {
  useClass: GetAllRoomsUseCase,
})


// bookings use case
container.register<ICreateBookingUseCase>(TOKENS.CreateBookingUseCase, {
  useClass: CreateBookingUseCase,
})

container.register<IGetBookingsByHotelUseCase>(TOKENS.GetBookingsByHotelUseCase, {
  useClass: GetBookingsByHotelUseCase,
})

container.register<IGetBookingsByUserUseCase>(TOKENS.GetBookingsByUserUseCase, {
  useClass: GetBookingsByUserUseCase,
})

container.register<ICancelBookingUseCase>(TOKENS.CancelRoomUseCase, {
  useClass: CancelBookingUseCase,
})

container.register<IGetBookingsToVendorUseCase>(TOKENS.GetBookingsToVendorUseCase, {
  useClass: GetBookingsToVendorUseCase,
})

container.register<IGetVendorHotelAnalyticsUseCase>(TOKENS.GetVendorHotelAnalyticsUseCase, {
  useClass: GetVendorHotelAnalyticsUseCase,
})


// amenities use case
container.register<ICreateAmenityUseCase>(TOKENS.CreateAmenityUseCase, {
  useClass: CreateAmenityUseCase,
})

container.register<IUpdateAmenityUseCase>(TOKENS.UpdateAmenityUseCase, {
  useClass: UpdateAmenityUseCase,
})

container.register<IBlockUnblockAmenityUseCase>(TOKENS.BlockUnblockAmenityUseCase, {
  useClass: BlockUnblockAmenity,
})

container.register<IGetAmenityByIdUseCase>(TOKENS.GetAmenityByIdUseCase, {
  useClass: GetAmenityByIdUseCase,
})

container.register<IGetAllAmenitiesUseCase>(TOKENS.GetAllAmenitiesUseCase, {
  useClass: GetAllAmenitiesUseCase,
})

container.register<IGetActiveAmenitiesUseCase>(TOKENS.GetActiveAmenitiesUseCase, {
  useClass: GetActiveAmenitiesUseCase,
})

container.register<IFindUsedActiveAmenitiesUseCase>(TOKENS.FindUsedActiveAmenitiesUseCase, {
  useClass: FindUsedActiveAmenitiesUseCase,
})


// subscription use case
container.register<ICreatePlanUseCase>(TOKENS.CreateSubscriptionUseCase, {
  useClass: CreatePlanUseCase,
})

container.register<IUpdatePlanUseCase>(TOKENS.UpdateSubscriptionUseCase, {
  useClass: UpdatePlanUseCase,
})

container.register<IGetActivePlansUseCase>(TOKENS.GetActiveSubscriptionsUseCase, {
  useClass: GetActivePlansUseCase,
})

container.register<IGetAllPlansUseCase>(TOKENS.GetAllSubscriptionsUseCase, {
  useClass: GetAllPlansUseCase,
})

container.register<IBlockUnblockPlanUseCase>(TOKENS.BlockUnblockSubscriptionUseCase, {
  useClass: BlockUnblockPlanUseCase,
})

container.register<IGetUserActivePlanUseCase>(TOKENS.GetUserActivePlanUseCase, {
  useClass: GetUserActivePlanUseCase,
})

container.register<ICancelSubscriptionUseCase>(TOKENS.CancelSubscriptionUseCase, {
  useClass: CancelSubscriptionUseCase,
})

// chat use case
container.register<IGetChatMessagesUseCase>(TOKENS.GetChatMessagesUseCase, {
  useClass: GetChatMessagesUseCase,
})

container.register<ISendMessageUseCase>(TOKENS.SendMessageUseCase, {
  useClass: SendMessageUseCase,
})

container.register<IGetChattedUsersUseCase>(TOKENS.GetChattedUsersUseCase, {
  useClass: GetChattedUsersUseCase,
})

container.register<IMarkMsgAsReadUseCase>(TOKENS.MarkMsgAsReadUseCase, {
  useClass: MarkMsgAsReadUseCase,
})

container.register<IGetVendorsChatWithUserUseCase>(TOKENS.GetVendorsChatWithUserUseCase, {
  useClass: GetVendorsChatWithUserUseCase,
})

container.register<IGetVendorsChatWithAdminUseCase>(TOKENS.GetVendorsChatWithAdminUseCase, {
  useClass: GetVendorsChatWithAdmiinUseCase,
})

container.register<IGetUserUnreadMsgUseCase>(TOKENS.GetUserUnreadMsgUseCase, {
  useClass: GetUserUnreadMsgUseCase,
})

container.register<IGetChatAccessUseCase>(TOKENS.GetChatAccessUseCase, {
  useClass: GetChatAccessUseCase,
})


// wallet use case
container.register<IGetWalletUseCase>(TOKENS.GetWalletUseCase, {
  useClass: GetWalletUseCase,
})

container.register<ICreateWalletUseCase>(TOKENS.CreateWalletUseCase, {
  useClass: CreateWalletUseCase,
})


// transaction use case
container.register<IBookingTransactionUseCase>(TOKENS.BookingTransactionUseCase, {
  useClass: BookingTransactionUseCase,
});

container.register<IAddMoneyToWalletUseCase>(TOKENS.AddMoneyToWalletUseCase, {
  useClass: AddMoneyToWalletUseCase,
})

container.register<IGetTransactionsUseCase>(TOKENS.GetTransactionsUseCase, {
  useClass: GetTransactionsUseCase,
});

container.register<ISubscribePlanUseCase>(TOKENS.SubscribePlanUseCase, {
  useClass: SubscribePlanUseCase,
})

container.register<IGetAllPlanHistoryUseCase>(TOKENS.GetAllPlanHistoryUseCase, {
  useClass: GetAllPlanHistoryUseCase,
})


// ratings
container.register<ICreateRatingUseCase>(TOKENS.CreateRatingUseCase, {
  useClass: CreateRatingUseCase,
})

container.register<IUpdateRatingUseCase>(TOKENS.UpdateRatingUseCase, {
  useClass: UpdateRatingUseCase,
})

container.register<IGetRatingUseCase>(TOKENS.GetRatingsUseCase, {
  useClass: GetRatingUseCase,
})

// coupons
container.register<ICreateCouponUseCase>(TOKENS.CreateCouponUseCase, {
  useClass: CreateCouponUseCase,
})

container.register<IUpdateCouponUseCase>(TOKENS.UpdateCouponUseCase, {
  useClass: UpdateCouponUseCase,
})

container.register<IGetVendorCouponsUseCase>(TOKENS.GetVendorCouponsUseCase, {
  useClass: GetVendorCouponsUseCase,
})

container.register<IGetUserCouponsUseCase>(TOKENS.GetUserCouponsUseCase, {
  useClass: GetUserCouponsUseCase,
})

container.register<IToggleCouponStatusUseCase>(TOKENS.ToggleCouponStatusUseCase, {
  useClass: ToggleCouponStatusUseCase,
})


// Offer
container.register<ICreateOfferUseCase>(TOKENS.CreateOfferUseCase, {
  useClass: CreateOfferUseCase,
})

container.register<IUpdateOfferUseCase>(TOKENS.UpdateOfferUseCase, {
  useClass: UpdateOfferUseCase,
})

container.register<IGetVendorOffersUseCase>(TOKENS.GetVendorOffersUseCase, {
  useClass: GetVendorOffersUseCase,
})

container.register<IDetectOfferForRoomUseCase>(TOKENS.DetectOfferForRoomUseCase, {
  useClass: DetectOfferForRoomUseCase,
})

container.register<IToggleOfferStatusUseCase>(TOKENS.ToggleOfferStatusUseCase, {
  useClass: ToggleOfferStatusUseCase,
})
