import { inject, injectable } from "tsyringe";
import { IUser, IUserRepository } from "../../../domain/interfaces/user.interface";
import { TOKENS } from "../../../constants/token";

@injectable()
export class GetAllUsers {
    constructor(
        @inject(TOKENS.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(): Promise<IUser[]> {
        const users = await this.userRepository.getAllUsers();
        
        const nonAdminUsers = users.filter(user => !user.role.includes('admin'));

        return nonAdminUsers;
    }
}
