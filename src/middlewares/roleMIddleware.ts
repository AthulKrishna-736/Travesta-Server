import { Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { CustomRequest } from "../utils/customRequest";
import { TRole } from "../shared/types/common.types";


export const authorizeRoles = (...roles: TRole[]) => {
    return (req: CustomRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Please sign in to continue.", HttpStatusCode.UNAUTHORIZED));
        }

        const userRole = req.user.role.toString();
        if (!roles.includes(userRole as TRole)) {
            return next(new AppError("You do not have permission to perform this action.", HttpStatusCode.FORBIDDEN));
        }

        next();
    };
};
