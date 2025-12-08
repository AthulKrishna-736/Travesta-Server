import { inject, injectable } from "tsyringe";
import { IGetVendorCouponsUseCase } from "../../../domain/interfaces/model/coupon.interface";
import { TOKENS } from "../../../constants/token";
import { ICouponRepository } from "../../../domain/interfaces/repositories/couponRepo.interface";
import { AppError } from "../../../utils/appError";
import { HttpStatusCode } from "../../../constants/HttpStatusCodes";
import { TResponseCouponDTO } from "../../../interfaceAdapters/dtos/coupon.dto";
import { ResponseMapper } from "../../../utils/responseMapper";


@injectable()
export class GetVendorCouponsUseCase implements IGetVendorCouponsUseCase {
    constructor(
        @inject(TOKENS.CouponRepository) private _couponRepository: ICouponRepository
    ) { }

    async getVendorCoupons(vendorId: string, page: number, limit: number, search?: string): Promise<{ coupons: TResponseCouponDTO[], total: number, message: string }> {
        const { coupons, total } = await this._couponRepository.getVendorCoupons(vendorId, page, limit, search);
        if (!coupons || coupons.length == 0 || total == 0) {
            throw new AppError('No coupons found. Please create one', HttpStatusCode.INTERNAL_SERVER_ERROR)
        }

        const mappedCoupons = coupons.map(ResponseMapper.mapCouponResponseToDTO);
        return { coupons: mappedCoupons, total, message: 'Fetched vendor coupons' };
    }
}
