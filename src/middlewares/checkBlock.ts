import { NextFunction, Response } from "express";
import { CustomRequest } from "../utils/customRequest";
import { container } from "tsyringe";
import { TOKENS } from "../constants/token";
import { IUserRepository } from "../domain/interfaces/user.interface";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";



export const checkUserBlock = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.user;
        const userRepo = container.resolve<IUserRepository>(TOKENS.UserRepository)

        if (data?.role == 'user') {
            const user = await userRepo.findByEmail(data.email!)
            if (!user) {
                throw new AppError('user not found', HttpStatusCode.UNAUTHORIZED);
            }

            if(user.isBlocked){
                throw new AppError('user is blocked', HttpStatusCode.UNAUTHORIZED)
            }

        }

        if(data?.role == 'vendor'){
            const vendor = await userRepo.findByEmail(data.email!)
            if(!vendor){
                throw new AppError('vendor not found', HttpStatusCode.UNAUTHORIZED)
            }
            if(vendor.isBlocked){
                throw new AppError('vendor is blocked', HttpStatusCode.UNAUTHORIZED)
            }
        }

        next()
    } catch (error) {
        next(error)
    }
}