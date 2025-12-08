import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { ICouponRepository } from "../../../domain/interfaces/repositories/couponRepo.interface";
import { IToggleCouponStatusUseCase } from "../../../domain/interfaces/model/coupon.interface";
import { TResponseCouponDTO } from "../../../interfaceAdapters/dtos/coupon.dto";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { ResponseMapper } from "../../../utils/responseMapper";


@injectable()
export class ToggleCouponStatusUseCase implements IToggleCouponStatusUseCase {
    constructor(
        @inject(TOKENS.CouponRepository) private _couponRepository: ICouponRepository,
    ) { }

    async toggleCouponStatus(couponId: string): Promise<{ coupon: TResponseCouponDTO; message: string; }> {
        const coupon = await this._couponRepository.findCouponById(couponId);
        if (!coupon) {
            throw new AppError('Coupon not found', HttpStatusCode.NOT_FOUND);
        }

        const updatedCoupon = await this._couponRepository.toggleCouponStatus(couponId);
        if (!updatedCoupon) {
            throw new AppError("Failed to update coupon", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }

        const mappedCoupon = ResponseMapper.mapCouponResponseToDTO(updatedCoupon);

        return {
            coupon: mappedCoupon,
            message: updatedCoupon.isBlocked
                ? "Coupon has been blocked"
                : "Coupon has been unblocked",
        }
    }
}