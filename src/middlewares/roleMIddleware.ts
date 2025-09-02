import { Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";
import { CustomRequest } from "../utils/customRequest";
import { TRole } from "../shared/types/client.types";


export const authorizeRoles = (...roles: TRole[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        console.log('req user console: ', req.user);
        if (!req.user) {
            return next(new AppError("Not authenticated", HttpStatusCode.UNAUTHORIZED));
        }
        const userRole = req.user.role.toString();

        console.log('check roles:', userRole, 'Allowed:', roles);
        if (!roles.includes(userRole as TRole)) {
            console.log('Role mismatch. User role:', userRole, 'Allowed roles:', roles);
            return next(new AppError("You are not authorized to access this resource", HttpStatusCode.FORBIDDEN));
        }

        next();
    };
};
