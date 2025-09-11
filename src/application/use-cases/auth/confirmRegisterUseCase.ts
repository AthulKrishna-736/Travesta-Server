import { inject, injectable } from "tsyringe";
import { IConfrimRegisterUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { IUser, TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { AppError } from "../../../utils/appError";
import { ICreateWalletUseCase } from "../../../domain/interfaces/model/wallet.interface";

@injectable()
export class ConfirmRegisterUseCase implements IConfrimRegisterUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
    ) { }

    async confirmRegister(userData: TUserRegistrationInput): Promise<IUser> {
        const existingUser = await this._userRepository.findUser(userData.email);
        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST);
        }

        const user = await this._userRepository.createUser(userData)
        if (!user) {
            throw new AppError('Failed to create user', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        await this._createWallet.createUserWallet(user._id as string)

        return user;
    }
}