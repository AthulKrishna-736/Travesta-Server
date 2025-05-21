import { container } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { UserRepository } from "../database/repositories/userRepo";
import { IAuthService } from "../../domain/services/authService.interface";
import { AuthService } from "../services/authService";
import { MailService } from "../services/mailService";
import { RedisService } from "../services/redisService"
import { IMailService } from "../../domain/services/mailService.interface";
import { ConfirmRegisterUseCase, ForgotPassUseCase, GoogleLoginUseCase, LoginUseCase, LogoutUseCase, RegisterUseCase, ResendOtpUseCase, ResetPassUseCase, VerifyOtpUseCase } from "../../application/use-cases/auth/authUseCases";
import { IConfrimRegisterUseCase, IForgotPassUseCase, IGoogleLoginUseCase, ILoginUseCase, ILogoutUseCases, IRegisterUseCase, IResendOtpUseCase, IResetPassUseCase, IVerifyOtpUseCase } from "../../domain/interfaces/auth.interface";
import { BlockUnblockUser } from "../../application/use-cases/admin/blockUser";
import { IBlockUnblockUser, ICreateHotelUseCase, IGetAllHotelsUseCase, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IGetHotelByIdUseCase, IGetUserUseCase, IGetVendorUseCase, IUpdateHotelUseCase, IUpdateKycUseCase, IUpdateUserUseCase, IUpdateVendorReqUseCase } from "../../domain/interfaces/usecases.interface";
import { GetAllUsers } from "../../application/use-cases/admin/getAllUsers";
import { GetAllVendorReq } from "../../application/use-cases/admin/getAllVendorReq";
import { UpdateVendorReq } from "../../application/use-cases/admin/updateVendorReq";
import { UpdateUser } from "../../application/use-cases/common/updateUserProfle";
import { IAwsS3Service } from "../../domain/services/awsS3Service.interface";
import { AwsS3Service } from "../services/awsS3Service";
import { GetUserProfileUseCase } from "../../application/use-cases/user/getUser";
import { UpdateKycUseCase } from "../../application/use-cases/vendor/updateKyc";
import { IHotelRepository, IUserRepository } from "../../domain/repositories/repository.interface";
import { GetVendorProfileUseCase } from "../../application/use-cases/vendor/getVendor";
import { HotelRepository } from "../database/repositories/hotelRepo";
import { CreateHotelUseCase, GetAllHotelsUseCase, GetHotelByIdUseCase, UpdateHotelUseCase } from "../../application/use-cases/vendor/hotelUseCases";


//repository
container.register<IUserRepository>(TOKENS.UserRepository, {
  useClass: UserRepository,
});

container.register<IHotelRepository>(TOKENS.HotelRepository, {
  useClass: HotelRepository,
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