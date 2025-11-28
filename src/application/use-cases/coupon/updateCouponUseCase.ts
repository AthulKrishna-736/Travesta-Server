import { inject, injectable } from "tsyringe";
import { IUpdateCouponUseCase } from "../../../domain/interfaces/model/coupon.interface";
import { TOKENS } from "../../../constants/token";
import { ICouponRepository } from "../../../domain/interfaces/repositories/couponRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { TResponseCouponDTO, TUpdateCouponDTO } from "../../../interfaceAdapters/dtos/coupon.dto";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class UpdateCouponUseCase implements IUpdateCouponUseCase {
    constructor(
        @inject(TOKENS.CouponRepository) private _couponRepository: ICouponRepository
    ) { }

    async updateCoupon(couponId: string, data: TUpdateCouponDTO): Promise<{ coupon: TResponseCouponDTO | null, message: string }> {

        const coupon = await this._couponRepository.findCouponById(couponId);
        if (!coupon) {
            throw new AppError('Coupon not found', HttpStatusCode.NOT_FOUND);
        }

        const finalUpdateObject = {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        }

        const updatedCoupon = await this._couponRepository.updateCoupon(couponId, finalUpdateObject);
        if (!updatedCoupon) {
            throw new AppError('Error while updating coupon', HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedCoupon = ResponseMapper.mapCouponResponseToDTO(updatedCoupon);

        return { coupon: mappedCoupon, message: 'Updated Coupon Successfully' };
    }
}
