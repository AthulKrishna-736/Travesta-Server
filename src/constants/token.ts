import { ForgotPassUseCase } from "../application/use-cases/auth/authUseCases";

export const TOKENS = {
  // Repositories
  UserRepository: 'UserRepository',

  // Services
  AuthService: 'AuthService',
  MailService: 'MailService',
  RedisService: 'RedisService',
  AwsS3Service: 'AwsS3Service',

  // Use Cases
  LoginUseCase: 'LoginUseCase',
  RegisterUseCase: 'RegisterUseCase',
  ConfirmRegisterUseCase: 'ConfirmRegisterUseCase',
  GoogleLoginUseCase: 'GoogleLoginUseCase',
  ForgotPassUseCase: 'ForgotPassUseCase',
  ResetPassUseCase: 'ResetPassUseCase',
  ResendOtpUseCase: 'ResendOtpUseCase',
  VerifyOtpUseCase: 'VerifyOtpUseCase',
  LogoutUseCase: 'LogoutUseCase',

  //admin UseCases
  BlockUserUseCase: 'BlockUserUseCase',
  GetAllUsersUseCase: 'GetAllUsersUseCase',
  GetAllVendorReqUseCase: 'GetAllVendorReqUseCase',
  UpdateVendorReqUseCase: 'UpdateVendorReqUseCase',

  //user UseCases
  UpdateUserUseCase: 'UpdateUserUseCase',
  GetUserUseCase: 'GetUserUseCase',

  //vendor UseCases
  UpdateKycUseCase: 'UpdateKycUseCase',
};
