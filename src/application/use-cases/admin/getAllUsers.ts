import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/user.interface";
import { TOKENS } from "../../../constants/token";
import { IGetAllUsersUseCase } from "../../../domain/interfaces/usecases.interface";
import { ResponseUserDTO } from "../../../interfaces/dtos/user/user.dto";

@injectable()
export class GetAllUsers implements IGetAllUsersUseCase {
    constructor(
        @inject(TOKENS.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(page: number, limit: number): Promise<{ users: ResponseUserDTO[]; total: number }> {
        const { users, total } = await this.userRepository.getAllUsers(page, limit);

        const nonAdminUsers: ResponseUserDTO[] = users.map((user) => {
            return {
                id: user._id!?.toString(),
                name: `${user.firstName}${user.lastName}`,
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
