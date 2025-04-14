import { container } from "tsyringe";
import { TOKENS } from "../constants/token";
import { UserRepository } from "../infrastructure/database/repositories/userRepo";
import { IUserRepository } from "../domain/interfaces/user.interface";
import { IAuthService } from "../application/interfaces/authService.interface";
import { AuthService } from "../infrastructure/services/authService";
import { MailService } from "../infrastructure/services/mailService";
import { RegisterUser } from "../application/use-cases/user/registerUser";
import { VerifyOtpAndRegister } from "../application/use-cases/user/verifyOtpAndRegister";
import { LoginUser } from "../application/use-cases/user/loginUser";
import { UpdateUser } from "../application/use-cases/user/updateUserProfle";


container.register<IUserRepository>(TOKENS.UserRepository, {
    useClass: UserRepository,
  });
  
  container.register<IAuthService>(TOKENS.AuthService, {
    useClass: AuthService,
  });
  
  container.register(TOKENS.MailService, {
    useClass: MailService,
  });
  
  container.register(TOKENS.RegisterUser, {
    useClass: RegisterUser,
  });
  
  container.register(TOKENS.VerifyOtpAndRegister, {
    useClass: VerifyOtpAndRegister,
  });
  
  container.register(TOKENS.LoginUser, {
    useClass: LoginUser,
  });
  
  container.register(TOKENS.UpdateUser, {
    useClass: UpdateUser,
  });