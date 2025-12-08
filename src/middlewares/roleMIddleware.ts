import { Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { CustomRequest } from "../utils/customRequest";
import { TRole } from "../shared/types/client.types";


export const authorizeRoles = (...roles: TRole[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Not authenticated", HttpStatusCode.UNAUTHORIZED));
        }
        
        const userRole = req.user.role.toString();
        if (!roles.includes(userRole as TRole)) {
            return next(new AppError("You are not authorized to access this resource", HttpStatusCode.FORBIDDEN));
        }

        next();
    };
};
