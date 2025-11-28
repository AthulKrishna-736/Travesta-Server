import { inject, injectable } from "tsyringe";
import { ICouponRepository } from "../../../domain/interfaces/repositories/couponRepo.interface";
import { TOKENS } from "../../../constants/token";
import { ICreateCouponUseCase } from "../../../domain/interfaces/model/coupon.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { TCreateCouponDTO, TResponseCouponDTO } from "../../../interfaceAdapters/dtos/coupon.dto";
import { ResponseMapper } from "../../../utils/responseMapper";
import mongoose from "mongoose";


@injectable()
export class CreateCouponUseCase implements ICreateCouponUseCase {
    constructor(
        @inject(TOKENS.CouponRepository) private _couponRepository: ICouponRepository,
    ) { }

    async createCoupon(data: TCreateCouponDTO): Promise<{ coupon: TResponseCouponDTO, message: string }> {

        const FinalCreateObject = {
            ...data,
            vendorId: new mongoose.Types.ObjectId(data.vendorId),
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        }

        const coupon = await this._couponRepository.createCoupon(FinalCreateObject);

        if (!coupon) {
            throw new AppError('Error while creating coupon', HttpStatusCode.INTERNAL_SERVER_ERROR)
        }

        const mappedCoupon = ResponseMapper.mapCouponResponseToDTO(coupon);
        return { coupon: mappedCoupon, message: 'Created coupon successfully' };
    }
}
