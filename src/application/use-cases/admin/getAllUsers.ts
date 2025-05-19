import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { IGetAllUsersUseCase } from "../../../domain/interfaces/usecases.interface";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";
import { IUserRepository } from "../../../domain/repositories/repository.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";

@injectable()
export class GetAllUsers implements IGetAllUsersUseCase {
    constructor(
        @inject(TOKENS.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async getAllUsers(page: number, limit: number, role: string, search: string): Promise<{ users: ResponseUserDTO[]; total: number }> {

        const { users, total } = await this.userRepository.findAllUser(page, limit, role, search);

        if(!users){
            throw new AppError('Cant fetch user try again later', HttpStatusCode.INTERNAL_SERVER_ERROR)
        }

        const nonAdminUsers: ResponseUserDTO[] = users
            .filter(user => user.role !== 'admin')
            .map((user) => {
                return {
                    id: user._id!?.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isGoogle: user.isGoogle ?? false,
                    phone: user.phone,
                    isBlocked: user.isBlocked,
                    wishlist: user.wishlist,
                    role: user.role,
                    subscriptionType: user.subscriptionType,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            })

        return { users: nonAdminUsers, total };
    }
}
