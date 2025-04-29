import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";
import { CustomRequest } from "../utils/customRequest";
import { TRole } from "../shared/types/user.types";


export const authorizeRoles = (...roles: TRole[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            console.log('not roles based authenticated')
            return next(new AppError("Not authenticated", HttpStatusCode.UNAUTHORIZED));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError("You are not authorized to access this resource", HttpStatusCode.FORBIDDEN));
        }

        next();
    };
};
