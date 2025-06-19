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
import { IBlockUnblockUser, ICancelBookingUseCase, ICreateBookingUseCase, ICreateHotelUseCase, ICreateRoomUseCase, IGetAllHotelsUseCase, IGetAllRoomsUseCase, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IGetAvailableRoomsByHotelUseCase, IGetBookingsByHotelUseCase, IGetBookingsByUserUseCase, IGetHotelByIdUseCase, IGetRoomByIdUseCase, IGetRoomsByHotelUseCase, IGetUserUseCase, IGetVendorUseCase, IUpdateHotelUseCase, IUpdateKycUseCase, IUpdateRoomUseCase, IUpdateUserUseCase, IUpdateVendorReqUseCase } from "../../domain/interfaces/model/usecases.interface";
import { GetAllUsers } from "../../application/use-cases/admin/getAllUsers";
import { GetAllVendorReq } from "../../application/use-cases/admin/getAllVendorReq";
import { UpdateVendorReq } from "../../application/use-cases/admin/updateVendorReq";
import { UpdateUser } from "../../application/use-cases/common/updateUserProfle";
import { IAwsS3Service } from "../../domain/interfaces/services/awsS3Service.interface";
import { AwsS3Service } from "../services/awsS3Service";
import { GetUserProfileUseCase } from "../../application/use-cases/user/getUser";
import { UpdateKycUseCase } from "../../application/use-cases/vendor/updateKyc";
import { IAmenitiesRepository, IHotelRepository, IRoomRepository, IUserRepository } from "../../domain/interfaces/repositories/repository.interface";
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
import { GetAvailableRoomsByHotelUseCase } from "../../application/use-cases/vendor/room/getAvlRoomsUseCase";
import { BookingRepository } from "../database/repositories/bookingRepo";
import { CreateBookingUseCase } from "../../application/use-cases/vendor/booking/createBookingUseCase";
import { GetBookingsByHotelUseCase } from "../../application/use-cases/vendor/booking/getBookingHotelUseCase";
import { GetBookingsByUserUseCase } from "../../application/use-cases/vendor/booking/getBookingUserUseCase";
import { CancelBookingUseCase } from "../../application/use-cases/vendor/booking/cancelBookingUseCase";
import { GetAllRoomsUseCase } from "../../application/use-cases/vendor/room/getAllRoomsUseCase";
import { AmenitiesRepository } from "../database/repositories/amenitiesRepo";
import { CreateAmenityUseCase } from "../../application/use-cases/admin/amenities/createAmenity.UseCase";
import { IBlockUnblockAmenityUseCase, ICreateAmenityUseCase, IGetActiveAmenitiesUseCase, IGetAllAmenitiesUseCase, IGetAmenityByIdUseCase, IUpdateAmenityUseCase } from "../../domain/interfaces/model/amenities.interface";
import { UpdateAmenityUseCase } from "../../application/use-cases/admin/amenities/updateAmenity.UseCase";
import { BlockUnblockAmenity } from "../../application/use-cases/admin/amenities/blockUnblockAmenity.UseCase";
import { GetAmenityByIdUseCase } from "../../application/use-cases/admin/amenities/getAmenityById.UseCase";
import { GetAllAmenitiesUseCase } from "../../application/use-cases/admin/amenities/getAllAmenities.UseCase";
import { GetActiveAmenitiesUseCase } from "../../application/use-cases/admin/amenities/getActiveAmenities.UseCase";

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

container.register(TOKENS.BookingRepository, {
  useClass: BookingRepository
})

container.register<IAmenitiesRepository>(TOKENS.AmenitiesRepository, {
  useClass: AmenitiesRepository,
})

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

container.register<IGetAvailableRoomsByHotelUseCase>(TOKENS.GetAvailableRoomsByHotelUseCase, {
  useClass: GetAvailableRoomsByHotelUseCase,
})

container.register<IGetAllRoomsUseCase>(TOKENS.GetAllRoomsUseCase, {
  useClass: GetAllRoomsUseCase,
})


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
  useClass: GetActiveAmenitiesUseCase
})



