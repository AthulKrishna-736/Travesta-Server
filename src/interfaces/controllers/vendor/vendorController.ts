import { Response } from "express";
import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user/user.dto";
import { container, inject, injectable } from "tsyringe";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../utils/HttpStatusCodes";
import { env } from "../../../infrastructure/config/env";
import { jwtConfig } from "../../../infrastructure/config/jwtConfig";
import { ResponseHandler } from "../../../middlewares/responseHandler";
import { IAuthService } from "../../../application/interfaces/authService.interface";
import { TOKENS } from "../../../constants/token";
import { CustomRequest } from "../../../utils/customRequest";

@injectable()
export class VendorController {
    constructor(
    ) { }


}
