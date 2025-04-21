import { container } from "tsyringe";
import { TOKENS } from "../constants/token";
import { UserRepository } from "../infrastructure/database/repositories/userRepo";
import { IUserRepository } from "../domain/interfaces/user.interface";
import { IAuthService } from "../application/interfaces/authService.interface";
import { AuthService } from "../infrastructure/services/authService";
import { MailService } from "../infrastructure/services/mailService";
import { RedisService } from "../infrastructure/services/redisService"

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