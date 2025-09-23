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

@injectable()
export class ConfirmRegisterUseCase implements IConfrimRegisterUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepository: IUserRepository,
        @inject(TOKENS.CreateWalletUseCase) private _createWallet: ICreateWalletUseCase,
    ) { }

    async confirmRegister(userData: TCreateUserDTO): Promise<TResponseUserDTO> {
        const existingUser = await this._userRepository.findUser(userData.email);
        if (existingUser) {
            throw new AppError(AUTH_ERROR_MESSAGES.userExist, HttpStatusCode.CONFLICT);
        }

        const user = await this._userRepository.createUser(userData)
        if (!user) {
            throw new AppError(AUTH_ERROR_MESSAGES.createFail, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        await this._createWallet.createUserWallet(user._id as string)

        const mappedUser = ResponseMapper.mapUserToResponseDTO(user);
        return mappedUser;
    }
}