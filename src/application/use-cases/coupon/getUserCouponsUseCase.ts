import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/token";
import { ICouponRepository } from "../../../domain/interfaces/repositories/couponRepo.interface";
import { ICoupon, IGetUserCouponsUseCase } from "../../../domain/interfaces/model/coupon.interface";
import { TResponseCouponDTO } from "../../../interfaceAdapters/dtos/coupon.dto";
import { ResponseMapper } from "../../../utils/responseMapper";

@injectable()
export class GetUserCouponsUseCase implements IGetUserCouponsUseCase {
    constructor(
        @inject(TOKENS.CouponRepository) private _couponRepository: ICouponRepository,
    ) { }

    async getUserCoupons(vendorId: string, price: number): Promise<{ coupons: TResponseCouponDTO[], message: string }> {
        const today = new Date();
        const coupons = await this._couponRepository.getUserAvailableCoupons(vendorId, today, price);

        if (!coupons || coupons.length == 0) {
            return { coupons: [], message: 'No coupons found' };
        }

        const mappedCoupons = coupons.map(ResponseMapper.mapCouponResponseToDTO);
        return { coupons: mappedCoupons, message: 'Fetched User Coupons successfully' };
    }
}
