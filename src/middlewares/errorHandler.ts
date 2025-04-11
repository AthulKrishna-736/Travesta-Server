import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";
import { error } from "console";

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const status = err instanceof AppError ? err.statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Something went wrong';

    res.status(status).json({
        success: false,
        error: message,
        statusCode: status
    });
}