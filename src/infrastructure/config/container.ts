import { container } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { UserRepository } from "../database/repositories/userRepo";
import { IAuthService } from "../../domain/interfaces/services/authService.interface";
import { AuthService } from "../services/authService";
import { MailService } from "../services/mailService";
import { RedisService } from "../services/redisService"
import { IMailService } from "../../domain/interfaces/services/mailService.interface";
import { IConfrimRegisterUseCase, IForgotPassUseCase, IGoogleLoginUseCase, ILoginUseCase, ILogoutUseCases, IRegisterUseCase, IResendOtpUseCase, IResetPassUseCase, IVerifyOtpUseCase } from "../../domain/interfaces/model/auth.interface";
import { BlockUnblockUser } from "../../application/use-cases/admin/blockUser";
import { IBlockUnblockUser, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IGetUserUseCase, IGetVendorUseCase, IUpdateKycUseCase, IUpdateUserUseCase, IUpdateVendorReqUseCase } from "../../domain/interfaces/model/usecases.interface";
import { GetAllUsers } from "../../application/use-cases/admin/getAllUsers";
import { GetAllVendorReq } from "../../application/use-cases/admin/getAllVendorReq";
import { UpdateVendorReq } from "../../application/use-cases/admin/updateVendorReq";
import { UpdateUser } from "../../application/use-cases/common/updateUserProfle";
import { IAwsS3Service } from "../../domain/interfaces/services/awsS3Service.interface";
import { AwsS3Service } from "../services/awsS3Service";
import { GetUserProfileUseCase } from "../../application/use-cases/user/getUser";
import { UpdateKycUseCase } from "../../application/use-cases/vendor/updateKyc";
import { GetVendorProfileUseCase } from "../../application/use-cases/vendor/getVendor";
import { HotelRepository } from "../database/repositories/hotelRepo";
import { CreateHotelUseCase } from "../../application/use-cases/vendor/hotel/createHotelUseCase";
import { UpdateHotelUseCase } from "../../application/use-cases/vendor/hotel/updateHotelUseCase";
import { GetHotelByIdUseCase } from "../../application/use-cases/vendor/hotel/getHotelUseCase";
import { GetAllHotelsUseCase } from "../../application/use-cases/vendor/hotel/getAllHotelsUseCase";
import { CreateRoomUseCase } from "../../application/use-cases/vendor/room/createRoomUseCase";
import { UpdateRoomUseCase } from "../../application/use-cases/vendor/room/updateRoomUseCase";
import { LoginUseCase } from "../../application/use-cases/auth/loginUseCase";
import { RegisterUseCase } from "../../application/use-cases/auth/registerUseCase";
import { ConfirmRegisterUseCase } from "../../application/use-cases/auth/confirmRegisterUseCase";
import { GoogleLoginUseCase } from "../../application/use-cases/auth/googleLoginUseCase";
import { ForgotPassUseCase } from "../../application/use-cases/auth/forgotPassUseCase";
import { ResetPassUseCase } from "../../application/use-cases/auth/resetPassUseCase";
import { ResendOtpUseCase } from "../../application/use-cases/auth/resendOtpUseCase";
import { VerifyOtpUseCase } from "../../application/use-cases/auth/verifyOtpUseCase";
import { LogoutUseCase } from "../../application/use-cases/auth/logoutUseCase";
import { RoomRepository } from "../database/repositories/roomRepo";
import { GetRoomByIdUseCase } from "../../application/use-cases/vendor/room/getRoomByIdUseCase";
import { GetRoomsByHotelUseCase } from "../../application/use-cases/vendor/room/getRoomByHotelUseCase";
import { BookingRepository } from "../database/repositories/bookingRepo";
import { CreateBookingUseCase } from "../../application/use-cases/vendor/booking/createBookingUseCase";
import { GetBookingsByHotelUseCase } from "../../application/use-cases/vendor/booking/getBookingHotelUseCase";
import { GetBookingsByUserUseCase } from "../../application/use-cases/vendor/booking/getBookingUserUseCase";
import { CancelBookingUseCase } from "../../application/use-cases/vendor/booking/cancelBookingUseCase";
import { GetAllRoomsUseCase } from "../../application/use-cases/vendor/room/getAllRoomsUseCase";
import { GetAvailableRoomsUseCase } from "../../application/use-cases/vendor/room/getAvlRoomsUseCase";
import { AmenitiesRepository } from "../database/repositories/amenitiesRepo";
import { CreateAmenityUseCase } from "../../application/use-cases/admin/amenities/createAmenity.UseCase";
import { IBlockUnblockAmenityUseCase, ICreateAmenityUseCase, IFindUsedActiveAmenitiesUseCase, IGetActiveAmenitiesUseCase, IGetAllAmenitiesUseCase, IGetAmenityByIdUseCase, IUpdateAmenityUseCase } from "../../domain/interfaces/model/amenities.interface";
import { UpdateAmenityUseCase } from "../../application/use-cases/admin/amenities/updateAmenity.UseCase";
import { BlockUnblockAmenity } from "../../application/use-cases/admin/amenities/blockUnblockAmenity.UseCase";
import { GetAmenityByIdUseCase } from "../../application/use-cases/admin/amenities/getAmenityById.UseCase";
import { GetAllAmenitiesUseCase } from "../../application/use-cases/admin/amenities/getAllAmenities.UseCase";
import { GetActiveAmenitiesUseCase } from "../../application/use-cases/admin/amenities/getActiveAmenities.UseCase";
import { SusbcriptionRepository } from "../database/repositories/subscription.Repo";
import { IBlockUnblockPlanUseCase, ICreatePlanUseCase, IGetActivePlansUseCase, IGetAllPlansUseCase, IUpdatePlanUseCase } from "../../domain/interfaces/model/subscription.interface";
import { CreatePlanUseCase } from "../../application/use-cases/admin/subscription/createPlan.UseCase";
import { UpdatePlanUseCase } from "../../application/use-cases/admin/subscription/updatePlan.UseCase";
import { GetActivePlansUseCase } from "../../application/use-cases/admin/subscription/getActivePlans.UseCase";
import { GetAllPlansUseCase } from "../../application/use-cases/admin/subscription/getAllPlans.UseCase";
import { BlockUnblockPlanUseCase } from "../../application/use-cases/admin/subscription/blockUnblockPlan.UseCase";
import { ICreateHotelUseCase, IGetAllHotelsUseCase, IGetHotelAnalyticsUseCase, IGetHotelByIdUseCase, IGetVendorHotelsUseCase, IUpdateHotelUseCase } from "../../domain/interfaces/model/hotel.interface";
import { ICreateRoomUseCase, IGetAllRoomsUseCase, IGetAvailableRoomsUseCase, IGetRoomByIdUseCase, IGetRoomsByHotelUseCase, IUpdateRoomUseCase } from "../../domain/interfaces/model/room.interface";
import { SocketService } from "../services/socketService";
import { ChatRepository } from "../database/repositories/chatRepo";
import { IGetChatAccessUseCase, IGetChatMessagesUseCase, IGetChattedUsersUseCase, IGetUserUnreadMsgUseCase, IGetVendorsChatWithAdminUseCase, IGetVendorsChatWithUserUseCase, IMarkMsgAsReadUseCase, ISendMessageUseCase } from "../../domain/interfaces/model/chat.interface";
import { GetChatMessagesUseCase } from "../../application/use-cases/chat/getChatMsg.UseCase.";
import { SendMessageUseCase } from "../../application/use-cases/chat/sendMsg.UseCase";
import { GetChattedUsersUseCase } from "../../application/use-cases/chat/getChatUsers.UseCase";
import { MarkMsgAsReadUseCase } from "../../application/use-cases/chat/markMsgRead.UseCase";
import { GetVendorsChatWithUserUseCase } from "../../application/use-cases/chat/getVendorsChattedWithUser.UseCase";
import { GetVendorsChatWithAdmiinUseCase } from "../../application/use-cases/chat/getVendorsChattedWithAdmin.UseCase";
import { ICancelBookingUseCase, ICreateBookingUseCase, IGetBookingsByHotelUseCase, IGetBookingsByUserUseCase, IGetBookingsToVendorUseCase, IGetCustomRoomDatesUseCase } from "../../domain/interfaces/model/booking.interface";
import { IAddMoneyToWalletUseCase, IBookingTransactionUseCase, ICreateWalletUseCase, IGetTransactionsUseCase, IGetWalletUseCase } from "../../domain/interfaces/model/wallet.interface";
import { GetWalletUseCase } from "../../application/use-cases/user/wallet/getWallet.UseCase";
import { CreateWalletUseCase } from "../../application/use-cases/user/wallet/createWallet.UseCase";
import { WalletRepository } from "../database/repositories/wallet.Repo";
import { StripeService } from "../services/stripeService";
import { GetBookingsToVendorUseCase } from "../../application/use-cases/vendor/booking/getBookingsToVendor";
import { FindUsedActiveAmenitiesUseCase } from "../../application/use-cases/admin/amenities/getUserActiveAmenities.UseCase";
import { GetUserUnreadMsgUseCase } from "../../application/use-cases/chat/getUserUnreadMsg.UseCase";
import { TransactionRepository } from "../database/repositories/transactionRepo";
import { BookingTransactionUseCase } from "../../application/use-cases/user/wallet/bookingTransaction.UseCase";
import { AddMoneyToWalletUseCase } from "../../application/use-cases/user/wallet/addMoneyTransaction.UseCase";
import { GetTransactionsUseCase } from "../../application/use-cases/user/wallet/getTransactions.UseCase";
import { GetVendorHotelsUseCase } from "../../application/use-cases/vendor/hotel/getHotelsByVendorUseCase";
import { AuthController } from "../../interfaceAdapters/controllers/authController";
import { IAuthController } from "../../domain/interfaces/controllers/authController.interface";
import { IUserController } from "../../domain/interfaces/controllers/userController.interface";
import { UserController } from "../../interfaceAdapters/controllers/userController";
import { IUserRepository } from "../../domain/interfaces/repositories/userRepo.interface";
import { IHotelRepository } from "../../domain/interfaces/repositories/hotelRepo.interface";
import { IRoomRepository } from "../../domain/interfaces/repositories/roomRepo.interface";
import { IBookingRepository } from "../../domain/interfaces/repositories/bookingRepo.interface";
import { IAmenitiesRepository } from "../../domain/interfaces/repositories/amenitiesRepo.interface";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/subscriptionRepo.interface";
import { IChatRepository } from "../../domain/interfaces/repositories/chatRepo.interface";
import { IWalletRepository } from "../../domain/interfaces/repositories/walletRepo.interface";
import { ITransactionRepository } from "../../domain/interfaces/repositories/transactionRepo.interface";
import { IVendorController } from "../../domain/interfaces/controllers/vendorController.interface";
import { VendorController } from "../../interfaceAdapters/controllers/vendorController";
import { IAdminController } from "../../domain/interfaces/controllers/adminController.interface";
import { AdminController } from "../../interfaceAdapters/controllers/adminController";
import { IHotelController } from "../../domain/interfaces/controllers/hotelController.interface";
import { HotelController } from "../../interfaceAdapters/controllers/hotelController";
import { IRoomController } from "../../domain/interfaces/controllers/roomController.interface";
import { RoomController } from "../../interfaceAdapters/controllers/roomController";
import { IBookingController } from "../../domain/interfaces/controllers/bookingController.interface";
import { BookingController } from "../../interfaceAdapters/controllers/bookingController";
import { IWalletController } from "../../domain/interfaces/controllers/walletController.interface";
import { WalletController } from "../../interfaceAdapters/controllers/walletController";
import { IChatController } from "../../domain/interfaces/controllers/chatController.interface";
import { ChatController } from "../../interfaceAdapters/controllers/chatController";
import { IAmenityController } from "../../domain/interfaces/controllers/amenityController.interface";
import { AmenityController } from "../../interfaceAdapters/controllers/amenityController";
import { SubscriptionController } from "../../interfaceAdapters/controllers/subscriptionController";
import { GetChatAccessUseCase } from "../../application/use-cases/chat/getChatAccess.UseCase";
import { GetCustomRoomDatesUseCase } from "../../application/use-cases/vendor/room/getCustomRoomDatesUseCase";
import { GetHotelAnalyticsUseCase } from "../../application/use-cases/vendor/hotel/getHotelAnalyticsUseCase";

//repository
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


//controllers
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


//services
container.register<IAuthService>(TOKENS.AuthService, {
  useClass: AuthService,
});

container.register<IMailService>(TOKENS.MailService, {
  useClass: MailService,
});

container.register(TOKENS.RedisService, {
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


//common UseCases
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


//admin UseCases
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


//user UseCases
container.register<IUpdateUserUseCase>(TOKENS.UpdateUserUseCase, {
  useClass: UpdateUser,
})

container.register<IGetUserUseCase>(TOKENS.GetUserUseCase, {
  useClass: GetUserProfileUseCase,
})


//vendor UseCases
container.register<IUpdateKycUseCase>(TOKENS.UpdateKycUseCase, {
  useClass: UpdateKycUseCase,
})

container.register<IGetVendorUseCase>(TOKENS.GetVendorUseCase, {
  useClass: GetVendorProfileUseCase,
})


//hotel UseCases
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

//room UseCase
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

container.register<IGetAvailableRoomsUseCase>(TOKENS.GetAvailableRoomsUseCase, {
  useClass: GetAvailableRoomsUseCase,
})

container.register<IGetAllRoomsUseCase>(TOKENS.GetAllRoomsUseCase, {
  useClass: GetAllRoomsUseCase,
})

container.register<IGetCustomRoomDatesUseCase>(TOKENS.GetCustomRoomDatesUseCase, {
  useClass: GetCustomRoomDatesUseCase,
})


//bookings use case
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


//amenities use case
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


//subscription use case
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


//chat use case
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


//wallet use case
container.register<IGetWalletUseCase>(TOKENS.GetWalletUseCase, {
  useClass: GetWalletUseCase,
})

container.register<ICreateWalletUseCase>(TOKENS.CreateWalletUseCase, {
  useClass: CreateWalletUseCase,
})


//transaction use case
container.register<IBookingTransactionUseCase>(TOKENS.BookingTransactionUseCase, {
  useClass: BookingTransactionUseCase,
});

container.register<IAddMoneyToWalletUseCase>(TOKENS.AddMoneyToWalletUseCase, {
  useClass: AddMoneyToWalletUseCase,
})

container.register<IGetTransactionsUseCase>(TOKENS.GetTransactionsUseCase, {
  useClass: GetTransactionsUseCase,
});