import { NextFunction, Response } from "express";
import { CustomRequest } from "../utils/customRequest";
import { container } from "tsyringe";
import { TOKENS } from "../constants/token";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { IUserRepository } from "../domain/interfaces/repositories/userRepo.interface";


export const checkUserBlock = async (req: CustomRequest, _res: Response, next: NextFunction) => {
    try {
        const data = req.user;

        if (!data) {
            throw new AppError('Unauthorized access. Please sign in.', HttpStatusCode.UNAUTHORIZED);
        }

        const userRepo = container.resolve<IUserRepository>(TOKENS.UserRepository)
        const user = await userRepo.findUserById(data.userId);
        if (!user) {
            throw new AppError('Account not found', HttpStatusCode.NOT_FOUND);
        }

        if (user.isBlocked) {
            throw new AppError('User is blocked', HttpStatusCode.FORBIDDEN);
        }

        next();
    } catch (error) {
        next(error)
    }
}