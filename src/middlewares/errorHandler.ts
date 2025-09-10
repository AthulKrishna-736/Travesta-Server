import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import logger from "../utils/logger";

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error('Error Message:', { message: err.message });
    logger.error('Error Stack: ', { stack: err.stack });

    const status = err instanceof AppError ? err.statusCode : HttpStatusCode.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Something went wrong';

    res.status(status).json({
        success: false,
        message,
        statusCode: status
    });
}