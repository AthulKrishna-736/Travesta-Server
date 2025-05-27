// import { inject, injectable } from "tsyringe";
// import { TOKENS } from "../../../constants/token";
// import { IUser } from "../../../domain/interfaces/model/user.interface";
// import { IAuthService, TOtpData } from "../../../domain/interfaces/services/authService.interface";
// import { v4 as uuidv4 } from 'uuid';
// import { AppError } from "../../../utils/appError";
// import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
// import logger from "../../../utils/logger";
// import { TRole } from "../../../shared/types/client.types";
// import { awsS3Timer, jwtConfig } from "../../../infrastructure/config/jwtConfig";
// import { OAuth2Client } from "google-auth-library";
// import { env } from "../../../infrastructure/config/env";
// import { IAwsS3Service } from "../../../domain/interfaces/services/awsS3Service.interface";
// import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
// import { IRedisService } from "../../../domain/interfaces/services/redisService.interface";
// import { IConfrimRegisterUseCase, IForgotPassUseCase, IGoogleLoginUseCase, ILoginUseCase, IRegisterUseCase, IResendOtpUseCase, IResetPassUseCase, IVerifyOtpUseCase } from "../../../domain/interfaces/model/auth.interface";

// @injectable()
// export class RegisterUseCase implements IRegisterUseCase {
//     constructor(
//         @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
//         @inject(TOKENS.AuthService) private _authService: IAuthService
//     ) { }

//     async register(userData: Partial<IUser>): Promise<{ userId: string; message: string; }> {
//         const existingUser = await this._userRepo.findUser(userData.email as string)

//         if (existingUser) {
//             throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST)
//         }

//         const otp = this._authService.generateOtp();
//         logger.info(`otp created: ${otp}`);
//         const hashPass = await this._authService.hashPassword(userData.password as string)

//         const tempUserId = `temp:signup:${uuidv4()}`

//         const newUserData = {
//             ...userData,
//             password: hashPass,
//             role: userData.role || 'user',
//             subscriptionType: userData.subscriptionType || 'basic',
//             createdAt: new Date(),
//             updatedAt: new Date()
//         };

//         await this._authService.storeOtp(tempUserId, otp, newUserData, 'signup');

//         await this._authService.sendOtpOnEmail(userData.email as string, otp,);

//         return {
//             userId: tempUserId,
//             message: 'OTP sent to email. Please verify to complete registration.',
//         }
//     }
// }

// @injectable()
// export class LoginUseCase implements ILoginUseCase {
//     constructor(
//         @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
//         @inject(TOKENS.AuthService) private _authService: IAuthService,
//         @inject(TOKENS.RedisService) private _redisService: IRedisService,
//         @inject(TOKENS.AwsS3Service) private _awsS3Service: IAwsS3Service,
//     ) { }


//     async login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string; refreshToken: string; user: IUser; }> {
//         const user = await this._userRepo.findUser(email);

//         if (!user || !user._id) {
//             throw new AppError("User not found", HttpStatusCode.BAD_REQUEST)
//         }

//         if (user.role !== expectedRole) {
//             throw new AppError(`Unauthorized: Invalid role for this login`, HttpStatusCode.UNAUTHORIZED);
//         }

//         if (user.isBlocked) {
//             throw new AppError(`${user.role} is blocked`, HttpStatusCode.UNAUTHORIZED);
//         }

//         const isValidPass = await this._authService.comparePassword(password, user.password)

//         if (!isValidPass) {
//             throw new AppError("Invalid credentials", HttpStatusCode.BAD_REQUEST)
//         }

//         const accessToken = this._authService.generateAccessToken(user._id, user.role, user.email);
//         const refreshToken = this._authService.generateRefreshToken(user._id, user.role, user.email);

//         let imageUrl;
//         let kycDocuments;

//         imageUrl = await this._redisService.getRedisSignedUrl(user._id, 'profile');

//         if (!imageUrl && user.profileImage) {
//             imageUrl = await this._awsS3Service.getFileUrlFromAws(user.profileImage!, awsS3Timer.expiresAt);
//             await this._redisService.storeRedisSignedUrl(user._id, imageUrl, awsS3Timer.expiresAt);
//         }

//         kycDocuments = await this._redisService.getRedisSignedUrl(user._id, 'kycDocs');

//         if (!kycDocuments && user.kycDocuments && user.kycDocuments.length > 0) {
//             kycDocuments = await Promise.all(
//                 user.kycDocuments.map(key =>
//                     this._awsS3Service.getFileUrlFromAws(key, awsS3Timer.expiresAt)
//                 )
//             );
//         }

//         const mappedUser: ResponseUserDTO = {
//             id: user._id,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//             phone: user.phone,
//             isGoogle: user.isGoogle ?? false,
//             isBlocked: user.isBlocked,
//             wishlist: user.wishlist,
//             role: user.role,
//             profileImage: imageUrl as string,
//             kycDocuments: kycDocuments as string[],
//             subscriptionType: user.subscriptionType,
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt,
//         };

//         await this._redisService.storeRefreshToken(user._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000)

//         return {
//             accessToken,
//             refreshToken,
//             user: mappedUser
//         }
//     }
// }

// @injectable()
// export class ConfirmRegisterUseCase implements IConfrimRegisterUseCase {
//     constructor(
//         @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
//     ) { }

//     async confirmRegister(userData: CreateUserDTO): Promise<IUser> {
//         const existingUser = await this._userRepo.findUser(userData.email);
//         if (existingUser) {
//             throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST);
//         }

//         const user = await this._userRepo.createUser(userData)
//         if (!user) {
//             throw new AppError('Failed to create user', HttpStatusCode.INTERNAL_SERVER_ERROR);
//         }
//         return user;
//     }
// }

// @injectable()
// export class GoogleLoginUseCase implements IGoogleLoginUseCase {
//     constructor(
//         @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
//         @inject(TOKENS.AuthService) private _authService: IAuthService,
//         @inject(TOKENS.RedisService) private _redisService: IRedisService,
//     ) { }
//     async loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string; refreshToken: string; user: IUser; }> {
//         const client = new OAuth2Client(env.GOOGLE_ID);

//         let payload;

//         try {
//             const ticket = await client.verifyIdToken({
//                 idToken: googleToken,
//                 audience: env.GOOGLE_ID,
//             });

//             payload = ticket.getPayload();
//         } catch (error) {
//             throw new AppError('Invalid Google Token', HttpStatusCode.UNAUTHORIZED);
//         }

//         if (!payload || !payload.email) {
//             throw new AppError("Unable to retrieve user information from Google", HttpStatusCode.BAD_REQUEST);
//         }

//         const email = payload.email;

//         let user = await this._userRepo.findUser(email);

//         if (!user) {
//             const newUser: CreateUserDTO = {
//                 firstName: payload.given_name || "Google",
//                 lastName: payload.family_name || "User",
//                 email: email,
//                 password: await this._authService.hashPassword(Math.random().toString(36).slice(-8)),
//                 phone: 0,
//                 role: role,
//                 subscriptionType: "basic",
//             }

//             user = await this._userRepo.createUser(newUser)
//         }

//         if (!user || !user._id) {
//             throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
//         }
//         await this._userRepo.updateUser(user._id, { isGoogle: true, profileImage: payload.picture })

//         if (user.isBlocked) {
//             throw new AppError('User is blocked', HttpStatusCode.UNAUTHORIZED);
//         }

//         const accessToken = this._authService.generateAccessToken(user._id, user.role, user.email);
//         const refreshToken = this._authService.generateRefreshToken(user._id, user.role, user.email);

//         await this._redisService.storeRefreshToken(user._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000)

//         return {
//             accessToken,
//             refreshToken,
//             user
//         }
//     }
// }

// @injectable()
// export class ForgotPassUseCase implements IForgotPassUseCase {
//     constructor(
//         @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
//         @inject(TOKENS.AuthService) private _authService: IAuthService,
//     ) { }

//     async forgotPass(email: string, role: TRole): Promise<{ userId: string; message: string; }> {
//         const user = await this._userRepo.findUser(email)
//         if (!user) {
//             throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
//         }

//         if (user.role !== role) {
//             throw new AppError('Unauthorized: Invalid role for the reset password', HttpStatusCode.UNAUTHORIZED)
//         }

//         const otp = this._authService.generateOtp();
//         console.log('password generate forgot: ', otp)
//         const tempUserId = `temp:reset:${uuidv4()}`;

//         await this._authService.storeOtp(tempUserId, otp, { email: user.email }, 'reset');

//         await this._authService.sendOtpOnEmail(user.email, otp);

//         return {
//             userId: tempUserId,
//             message: 'Otp sent successfully'
//         }
//     }
// }


// @injectable()
// export class ResetPassUseCase implements IResetPassUseCase {
//     constructor(
//         @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
//         @inject(TOKENS.AuthService) private _authService: IAuthService,
//     ) { }

//     async resetPass(email: string, password: string): Promise<void> {
//         if (!email) {
//             throw new AppError('Email is missing', HttpStatusCode.BAD_REQUEST);
//         }

//         const user = await this._userRepo.findUser(email);

//         if (!user || !user._id) {
//             throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
//         }

//         const isMatch = await this._authService.comparePassword(password, user.password)

//         if (isMatch) {
//             throw new AppError('New password must be different from the old password.', HttpStatusCode.CONFLICT);
//         }

//         const hashPass = await this._authService.hashPassword(password)
//         await this._userRepo.updateUser(user._id, { password: hashPass })
//     }
// }

// @injectable()
// export class ResendOtpUseCase implements IResendOtpUseCase {
//     constructor(
//         @inject(TOKENS.AuthService) private _authService: IAuthService,
//     ) { }
//     async resendOtp(userId: string, purpose: "signup" | "reset"): Promise<{ message: string; }> {

//         if (!userId) {
//             throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
//         }

//         await this._authService.resendOtp(userId, purpose)
//         return { message: 'OTP resent to you email' }
//     }
// }

// @injectable()
// export class VerifyOtpUseCase implements IVerifyOtpUseCase {
//     constructor(
//         @inject(TOKENS.AuthService) private _authService: IAuthService,
//         @inject(TOKENS.ConfirmRegisterUseCase) private _register: IConfrimRegisterUseCase,
//     ) { }

//     async verifyOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<{ isOtpVerified: boolean, data: TOtpData }> {
//         const data = await this._authService.verifyOtp(userId, otp, purpose)
//         if (!data) {
//             throw new AppError('Invalid or expired Otp', HttpStatusCode.BAD_REQUEST)
//         }

//         if (purpose == 'signup') {
//             const user = await this._register.confirmRegister(data as CreateUserDTO)
//             return {
//                 isOtpVerified: true,
//                 data: user,
//             }
//         }
//         console.log(`[VERIFY_OTP] OTP verified for user ${userId} with purpose ${purpose}`);

//         return {
//             isOtpVerified: true,
//             data,
//         }
//     }
// }

// @injectable()
// export class LogoutUseCase {
//     constructor(
//         @inject(TOKENS.AuthService) private _authService: IAuthService,
//         @inject(TOKENS.RedisService) private _redisService: IRedisService,
//     ) { }

//     async logout(accessToken: string, refreshToken: string): Promise<{ message: string }> {
//         let userId: string;
//         try {
//             const decoded = this._authService.verifyAccessToken(accessToken);
//             if (!decoded || !decoded.userId) {
//                 throw new AppError('User id is missing in accessToken', HttpStatusCode.BAD_REQUEST);
//             }
//             userId = decoded.userId;
//         } catch (error) {
//             logger.error(`error in logout: ${error}`);
//             const decoded = this._authService.verifyRefreshToken(refreshToken)
//             if (!decoded || !decoded.userId) {
//                 throw new AppError('User id is missing in refreshToken', HttpStatusCode.BAD_REQUEST);
//             }
//             userId = decoded.userId;
//         }

//         await this._redisService.deleteRefreshToken(userId)

//         await this._redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000)

//         return { message: 'Logged out successfully' }
//     }
// }