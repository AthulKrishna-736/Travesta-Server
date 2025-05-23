import { container } from "tsyringe";
import { TOKENS } from "../../constants/token";
import { UserRepository } from "../database/repositories/userRepo";
import { IAuthService } from "../../application/interfaces/authService.interface";
import { AuthService } from "../services/authService";
import { MailService } from "../services/mailService";
import { RedisService } from "../services/redisService"
import { IMailService } from "../../application/interfaces/mailService.interface";
import { AuthUseCases } from "../../application/use-cases/auth/authUseCases";
import { IAuthUseCases } from "../../domain/interfaces/auth.interface";
import { BlockUnblockUser } from "../../application/use-cases/admin/blockUser";
import { IBlockUnblockUser, IGetAllUsersUseCase, IGetAllVendorReqUseCase, IGetUserUseCase, IUpdateKycUseCase, IUpdateUserUseCase, IUpdateVendorReqUseCase } from "../../domain/interfaces/usecases.interface";
import { GetAllUsers } from "../../application/use-cases/admin/getAllUsers";
import { GetAllVendorReq } from "../../application/use-cases/admin/getAllVendorReq";
import { UpdateVendorReq } from "../../application/use-cases/admin/updateVendorReq";
import { UpdateUser } from "../../application/use-cases/common/updateUserProfle";
import { IAwsS3Service } from "../../application/interfaces/awsS3Service.interface";
import { AwsS3Service } from "../services/awsS3Service";
import { GetUserProfileUseCase } from "../../application/use-cases/user/getUser";
import { UpdateKycUseCase } from "../../application/use-cases/vendor/updateKyc";
import { IUserRepository } from "../../domain/repositories/repository.interface";


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
  useClass: RedisService,
})

container.register<IAwsS3Service>(TOKENS.AwsS3Service, {
  useClass: AwsS3Service,
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