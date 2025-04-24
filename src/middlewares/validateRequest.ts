import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";

export const validateRequest = (schema: ZodSchema<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('checking the body: ',req.body)
            schema.parse(req.body);
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                const formatted = error.flatten()
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: 'Validation error',
                    error: formatted.fieldErrors,
                });
                return
            }
            next(new AppError("Invalid request data", HttpStatusCode.BAD_REQUEST))
        }
    }
}