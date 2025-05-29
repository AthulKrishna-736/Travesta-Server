import { inject, injectable } from "tsyringe";
import { IConfrimRegisterUseCase } from "../../../domain/interfaces/model/auth.interface";
import { IUserRepository } from "../../../domain/interfaces/repositories/repository.interface";
import { TOKENS } from "../../../constants/token";
import { IUser, TUserRegistrationInput } from "../../../domain/interfaces/model/user.interface";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { AppError } from "../../../utils/appError";

@injectable()
export class ConfirmRegisterUseCase implements IConfrimRegisterUseCase {
    constructor(
        @inject(TOKENS.UserRepository) private _userRepo: IUserRepository,
    ) { }

    async confirmRegister(userData: TUserRegistrationInput): Promise<IUser> {
        const existingUser = await this._userRepo.findUser(userData.email);
        if (existingUser) {
            throw new AppError('User already exists', HttpStatusCode.BAD_REQUEST);
        }

        const user = await this._userRepo.createUser(userData)
        if (!user) {
            throw new AppError('Failed to create user', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
        return user;
    }
}