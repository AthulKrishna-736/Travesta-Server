import { Response } from "express";
import { HttpStatusCode } from "../utils/HttpStatusCodes";

export class ResponseHandler {
    static success(
        res: Response,
        message: string,
        data: any = null,
        statusCode: number = HttpStatusCode.OK,
        meta: Record<string, any> | null = null
    ): Response {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            meta,
            statusCode
        });
    }
}