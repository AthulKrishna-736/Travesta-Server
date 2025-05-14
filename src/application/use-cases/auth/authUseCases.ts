import { inject, injectable } from "tsyringe";
import { IAuthUseCases } from "../../../domain/interfaces/auth.interface";
import { TOKENS } from "../../../constants/token";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { CreateUserDTO, ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IAuthService } from "../../interfaces/authService.interface";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import logger from "../../../utils/logger";
import { TRole } from "../../../shared/types/client.types";
import { IJwtService } from "../../interfaces/jwtService.interface";
import { IOtpService } from "../../interfaces/otpService.interface";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../../infrastructure/config/env";
import { IAwsS3Service } from "../../interfaces/awsS3Service.interface";


@injectable()
export class AuthUseCases implements IAuthUseCases {
    constructor(
        @inject(TOKENS.UserRepository) private readonly _userRepo: IUserRepository,
        @inject(TOKENS.AuthService) private readonly _authService: IAuthService,
        @inject(TOKENS.AwsS3Service) private readonly _awsS3Service: IAwsS3Service,
        @inject(TOKENS.RedisService) private readonly _redisService: IJwtService & IOtpService,
    ) { }

    async register(userData: CreateUserDTO): Promise<{ userId: string; message: string; }> {
        const existingUser = await this._userRepo.findByEmail(userData.email)

        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST)
        }

        const otp = this._authService.generateOtp();
        logger.info(`otp created: ${otp}`);
        const hashPass = await this._authService.hashPassword(userData.password)

        const tempUserId = `temp:signup:${uuidv4()}`

        const newUserData = {
            ...userData,
            password: hashPass,
            role: userData.role || 'user',
            subscriptionType: userData.subscriptionType || 'basic',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this._authService.storeOtp(tempUserId, otp, newUserData, 'signup');

        await this._authService.sendOtpOnEmail(userData.email, otp,);

        return {
            userId: tempUserId,
            message: 'OTP sent to email. Please verify to complete registration.',
        }
    }

    async login(email: string, password: string, expectedRole: TRole): Promise<{ accessToken: string; refreshToken: string; user: ResponseUserDTO; }> {
        const user = await this._userRepo.findByEmail(email);

        if (!user || !user._id) {
            throw new AppError("User not found", HttpStatusCode.BAD_REQUEST)
        }

        if (user.role !== expectedRole) {
            throw new AppError(`Unauthorized: Invalid role for this login`, HttpStatusCode.UNAUTHORIZED);
        }

        if (user.isBlocked) {
            throw new AppError(`${user.role} is blocked`, HttpStatusCode.UNAUTHORIZED);
        }

        const isValidPass = await this._authService.comparePassword(password, user.password)

        if (!isValidPass) {
            throw new AppError("Invalid credentials", HttpStatusCode.BAD_REQUEST)
        }

        const accessToken = this._authService.generateAccessToken(user._id, user.role, user.email);
        const refreshToken = this._authService.generateRefreshToken(user._id, user.role, user.email);

        const getSignedUrl = await this._awsS3Service.getFileUrlFromAws(user.profileImage!, 84600);

        let signedKycUrls: string[] = [];

        if (user.kycDocuments && user.kycDocuments.length > 0) {
            signedKycUrls = await Promise.all(
                user.kycDocuments.map(key =>
                    this._awsS3Service.getFileUrlFromAws(key, 86400)
                )
            );
        }

        const mappedUser: ResponseUserDTO = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            isGoogle: user.isGoogle ?? false,
            isBlocked: user.isBlocked,
            wishlist: user.wishlist,
            role: user.role,
            profileImage: getSignedUrl,
            kycDocuments: signedKycUrls,
            subscriptionType: user.subscriptionType,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        await this._redisService.storeRefreshToken(user._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000)

        return {
            accessToken,
            refreshToken,
            user: mappedUser
        }
    }

    async confirmRegister(userData: CreateUserDTO & { createdAt: Date; updatedAt: Date; }): Promise<IUser> {
        const existingUser = await this._userRepo.findByEmail(userData.email);
        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST);
        }

        const user = await this._userRepo.createUser(userData)
        if (!user) {
            throw new AppError('Failed to create user', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
        return user;
    }

    async loginGoogle(googleToken: string, role: TRole): Promise<{ accessToken: string; refreshToken: string; user: IUser; }> {
        const client = new OAuth2Client(env.GOOGLE_ID);

        let payload;

        try {
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: env.GOOGLE_ID,
            });

            payload = ticket.getPayload();
        } catch (error: any) {
            throw new AppError('Invalid Google Token', HttpStatusCode.UNAUTHORIZED);
        }

        if (!payload || !payload.email) {
            throw new AppError("Unable to retrieve user information from Google", HttpStatusCode.BAD_REQUEST);
        }

        const email = payload.email;

        let user = await this._userRepo.findByEmail(email);

        if (!user) {
            const newUser: CreateUserDTO = {
                firstName: payload.given_name || "Google",
                lastName: payload.family_name || "User",
                email: email,
                password: await this._authService.hashPassword(Math.random().toString(36).slice(-8)),
                phone: 0,
                role: role,
                subscriptionType: "basic",
            }

            user = await this._userRepo.createUser(newUser)
        }

        if (!user || !user._id) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }
        await this._userRepo.updateUser(user._id, { isGoogle: true, profileImage: payload.picture })

        if (user.isBlocked) {
            throw new AppError('User is blocked', HttpStatusCode.UNAUTHORIZED);
        }

        const accessToken = this._authService.generateAccessToken(user._id, user.role, user.email);
        const refreshToken = this._authService.generateRefreshToken(user._id, user.role, user.email);

        await this._redisService.storeRefreshToken(user._id, refreshToken, jwtConfig.refreshToken.maxAge / 1000)

        return {
            accessToken,
            refreshToken,
            user
        }
    }

    async forgotPass(email: string, role: TRole): Promise<{ userId: string; message: string; }> {
        const user = await this._userRepo.findByEmail(email)
        if (!user) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST);
        }

        if (user.role !== role) {
            throw new AppError('Unauthorized: Invalid role for the reset password', HttpStatusCode.UNAUTHORIZED)
        }

        const otp = this._authService.generateOtp();
        const tempUserId = `temp:reset:${uuidv4()}`;

        await this._authService.storeOtp(tempUserId, otp, { email: user.email }, 'reset');

        await this._authService.sendOtpOnEmail(user.email, otp);

        return {
            userId: tempUserId,
            message: 'Otp sent successfully'
        }
    }

    async resetPass(email: string, password: string): Promise<void> {
        if (!email) {
            throw new AppError('Email is missing', HttpStatusCode.BAD_REQUEST);
        }

        const user = await this._userRepo.findByEmail(email);

        if (!user || !user._id) {
            throw new AppError('User not found', HttpStatusCode.BAD_REQUEST)
        }

        const isMatch = await this._authService.comparePassword(password, user.password)

        if (isMatch) {
            throw new AppError('New password must be different from the old password.', HttpStatusCode.CONFLICT);
        }

        const hashPass = await this._authService.hashPassword(password)
        await this._userRepo.updatePassword(user._id, hashPass)
    }

    async resendOtp(userId: string, purpose: "signup" | "reset"): Promise<{ message: string; }> {
        await this._authService.resendOtp(userId, purpose)
        return { message: 'OTP resent to you email' }
    }

    async verifyOtp(userId: string, otp: string, purpose: "signup" | "reset"): Promise<{ isOtpVerified: boolean; data: any; }> {
        const data = await this._authService.verifyOtp(userId, otp, purpose)
        if (!data) {
            throw new AppError('Invalid or expired Otp', HttpStatusCode.BAD_REQUEST)
        }

        if (purpose == 'signup') {
            const user = await this.confirmRegister(data)
            return {
                isOtpVerified: true,
                data: user,
            }
        }
        console.log(`[VERIFY_OTP] OTP verified for user ${userId} with purpose ${purpose}`);

        return {
            isOtpVerified: true,
            data,
        }
    }

    async logout(accessToken: string, refreshToken: string): Promise<{ message: string }> {
        let userId: string;
        try {
            const decoded = this._authService.verifyAccessToken(accessToken);
            if (!decoded || !decoded.userId) {
                throw new AppError('User id is missing in accessToken', HttpStatusCode.BAD_REQUEST);
            }
            userId = decoded.userId;
        } catch (error) {
            logger.error(`error in logout: ${error}`);
            const decoded = this._authService.verifyRefreshToken(refreshToken)
            if (!decoded || !decoded.userId) {
                throw new AppError('User id is missing in refreshToken', HttpStatusCode.BAD_REQUEST);
            }
            userId = decoded.userId;
        }

        await this._redisService.deleteRefreshToken(userId)

        await this._redisService.blacklistAccessToken(accessToken, jwtConfig.accessToken.maxAge / 1000)

        return { message: 'Logged out successfully' }
    }
}