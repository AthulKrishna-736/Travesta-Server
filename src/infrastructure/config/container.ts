import { container } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { UserRepository } from "../database/repositories/userRepo";
import { IUserRepository } from "../../domain/interfaces/user.interface";
import { IAuthService } from "../../application/interfaces/authService.interface";
import { AuthService } from "../services/authService";
import { MailService } from "../services/mailService";
import { RedisService } from "../services/redisService"
import { IMailService } from "../../application/interfaces/mailService.interface";
import { AuthUseCases } from "../../application/use-cases/auth/authUseCases";
import { IAuthUseCases } from "../../domain/interfaces/auth.interface";
import { BlockUnblockUser } from "../../application/use-cases/admin/blockUser";
import { IBlockUnblockUser, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IUpdateVendorReqUseCase } from "../../domain/interfaces/usecases.interface";
import { GetAllUsers } from "../../application/use-cases/admin/getAllUsers";
import { GetAllVendorReq } from "../../application/use-cases/admin/getAllVendorReq";
import { UpdateVendorReq } from "../../application/use-cases/admin/updateVendorReq";


//repository
container.register<IUserRepository>(TOKENS.UserRepository, {
  useClass: UserRepository,
});


//services
container.register<IAuthService>(TOKENS.AuthService, {
  useClass: AuthService,
});

container.register<IMailService>(TOKENS.MailService, {
  useClass: MailService,
});

container.register(TOKENS.RedisService, {
  useClass: RedisService
})


//common UseCases
container.register<IAuthUseCases>(TOKENS.AuthUseCases, {
  useClass: AuthUseCases
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


//vendor UseCases