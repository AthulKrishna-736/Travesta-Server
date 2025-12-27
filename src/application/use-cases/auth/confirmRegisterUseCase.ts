import { inject, injectable } from "tsyringe";
import { IConfrimRegisterUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/userRepo.interface";
import { TOKENS } from "../../../constants/token";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { ICreateWalletUseCase } from "../../../domain/interfaces/model/wallet.interface";
import { AUTH_ERROR_MESSAGES } from "../../../constants/errorMessages";
import { TCreateUserDTO, TResponseUserDTO } from "../../../interfaceAdapters/dtos/user.dto";
import { ResponseMapper } from "../../../utils/responseMapper";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/subscriptionRepo.interface";
import { INotificationRepository } from "../../../domain/interfaces/repositories/notificationRepo.interface";

@injectable()
export class ConfirmRegisterUseCase implements IConfrimRegisterUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
        @inject(TOKENS.SubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
        @inject(TOKENS.NotificationRepository) private _notificationRepository: INotificationRepository,
    ) { }

    async confirmRegister(userData: TCreateUserDTO): Promise<TResponseUserDTO> {
        const existingUser = await this._userRepository.findUser(userData.email);
        if (existingUser) {
            throw new AppError(AUTH_ERROR_MESSAGES.userExist, HttpStatusCode.CONFLICT);
        }

        const user = await this._userRepository.createUser(userData)
        if (!user || !user._id) {
            throw new AppError(AUTH_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const plan = await this._subscriptionRepository.findPlanByType('basic');
        if (!plan) {
            throw new AppError('Plan not found', HttpStatusCode.NOT_FOUND)
        }

        await Promise.all([
            this._createWallet.createUserWallet(user._id),
            this._userRepository.subscribeUser(user._id, { subscription: plan._id }),
            this._notificationRepository.createNotification({
                userId: user._id.toString(),
                title: "Welcome to Travesta Hotel Booking!",
                message: `Hi ${user.firstName}, welcome to Travesta! We're thrilled to have you onboard. Start exploring and enjoy seamless hotel bookings with us.`,
            })
        ])

        const mappedUser = ResponseMapper.mapUserToResponseDTO(user);
        return mappedUser;
    }
}