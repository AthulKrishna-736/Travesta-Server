import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../utils/appError";
import { HttpStatusCode } from "../utils/HttpStatusCodes";
import fs from 'fs/promises';

export const validateRequest = (schema: ZodSchema<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('zod req body: ', req.body);
            schema.parse(req.body);
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch(() => { });
                }
                if (Array.isArray(req.files)) {
                    await Promise.all(
                        req.files.map((file: Express.Multer.File) =>
                            fs.unlink(file.path).catch((err) => { console.log('err delete files: ', err) })
                        )
                    );
                }
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