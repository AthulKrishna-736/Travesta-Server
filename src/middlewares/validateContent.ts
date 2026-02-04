import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { AppError } from "../utils/appError";


export const validateContent = (req: Request, _res: Response, next: NextFunction) => {
    const accept = req.headers.accept;

    if (accept && accept !== '*/*' && !accept.includes('application/json')) {
        throw new AppError('Only application/json responses are supported', HttpStatusCode.NOT_ACCEPTABLE);
    }

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];

        if (!contentType) {
            throw new AppError('Content-Type header is required', HttpStatusCode.UNSUPPORTED_MEDIA);
        }

        const isJson = contentType.includes('application/json');
        const isMultipart = contentType.includes('multipart/form-data');

        if (!isJson && !isMultipart) {
            throw new AppError('Supported Content-Types: application/json, multipart/form-data', HttpStatusCode.UNSUPPORTED_MEDIA);
        }
    }

    next();
}