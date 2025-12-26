import { LoginUseCase } from "../../../application/use-cases/auth/loginUseCase";
import { RegisterUseCase } from "../../../application/use-cases/auth/registerUseCase";
import { ConfirmRegisterUseCase } from "../../../application/use-cases/auth/confirmRegisterUseCase";
import { GoogleLoginUseCase } from "../../../application/use-cases/auth/googleLoginUseCase";
import { ForgotPassUseCase } from "../../../application/use-cases/auth/forgotPassUseCase";
import { ResetPassUseCase } from "../../../application/use-cases/auth/resetPassUseCase";
import { ResendOtpUseCase } from "../../../application/use-cases/auth/resendOtpUseCase";
import { VerifyOtpUseCase } from "../../../application/use-cases/auth/verifyOtpUseCase";
import { LogoutUseCase } from "../../../application/use-cases/auth/logoutUseCase";

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
} from "../../../domain/interfaces/model/auth.interface";
import { container } from "tsyringe";
import { TOKENS } from "../../../constants/token";


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
