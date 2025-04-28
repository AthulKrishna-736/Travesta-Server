import { container } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { UserRepository } from "../database/repositories/userRepo";
import { IUserRepository } from "../../domain/interfaces/user.interface";
import { IAuthService } from "../../application/interfaces/authService.interface";
import { AuthService } from "../services/authService";
import { MailService } from "../services/mailService";
import { RedisService } from "../services/redisService"
import { IForgotPasswordUseCase, IGoogleLoginUseCase, ILoginUserUseCase, IRegisterUserUseCase, IResendOtpUseCase, IUpdatePasswordUseCase, IUpdateUserUseCase, IVerifyAndRegisterUseCase, IVerifyKycUseCase, IVerifyOtpUseCase } from "../../domain/interfaces/usecases.interface";
import { RegisterUser } from "../../application/use-cases/user/registerUser";
import { ForgotPass } from "../../application/use-cases/user/forgotPass";
import { LoginUser } from "../../application/use-cases/user/loginUser";
import { ResendOtp } from "../../application/use-cases/user/resendOtp";
import { UpdatePassword } from "../../application/use-cases/user/updatePassword";
import { UpdateUser } from "../../application/use-cases/user/updateUserProfle";
import { VerifyAndRegister } from "../../application/use-cases/user/verifyAndRegister";
import { VerifyKyc } from "../../application/use-cases/user/verifyKyc";
import { GoogleLogin } from "../../application/use-cases/googleLogin";
import { VerifyOtp } from "../../application/use-cases/verifyOtp";

container.register<IUserRepository>(TOKENS.UserRepository, {
  useClass: UserRepository,
});

container.register<IAuthService>(TOKENS.AuthService, {
  useClass: AuthService,
});

container.register(TOKENS.MailService, {
  useClass: MailService,
});

container.register(TOKENS.RedisService, {
  useClass: RedisService
})

container.register<IRegisterUserUseCase>(TOKENS.RegisterUserUseCase, {
  useClass: RegisterUser,
});

container.register<IForgotPasswordUseCase>(TOKENS.ForgotPasswordUseCase, {
  useClass: ForgotPass,
});

container.register<ILoginUserUseCase>(TOKENS.LoginUserUseCase, {
  useClass: LoginUser,
});

container.register<IResendOtpUseCase>(TOKENS.ResendOtpUseCase, {
  useClass: ResendOtp,
});

container.register<IUpdatePasswordUseCase>(TOKENS.UpdatePasswordUseCase, {
  useClass: UpdatePassword,
});

container.register<IUpdateUserUseCase>(TOKENS.UpdateUserUseCase, {
  useClass: UpdateUser,
});

container.register<IVerifyAndRegisterUseCase>(TOKENS.VerifyAndRegisterUseCase, {
  useClass: VerifyAndRegister,
});

container.register<IVerifyKycUseCase>(TOKENS.VerifyKycUseCase, {
  useClass: VerifyKyc,
});

container.register<IGoogleLoginUseCase>(TOKENS.GoogleLoginUseCase, {
  useClass: GoogleLogin,
});

container.register<IVerifyOtpUseCase>(TOKENS.VerifyOtpUseCase, {
  useClass: VerifyOtp,
})