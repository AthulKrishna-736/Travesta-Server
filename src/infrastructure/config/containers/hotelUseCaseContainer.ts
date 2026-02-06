import { CreateHotelUseCase } from "../../../application/use-cases/vendor/hotel/createHotelUseCase";
import { UpdateHotelUseCase } from "../../../application/use-cases/vendor/hotel/updateHotelUseCase";
import { GetHotelByIdUseCase } from "../../../application/use-cases/vendor/hotel/getHotelByIdUseCase";
import { GetAllHotelsUseCase } from "../../../application/use-cases/vendor/hotel/getAllHotelsUseCase";
import { GetBookingsByHotelUseCase } from "../../../application/use-cases/vendor/booking/getBookingHotelUseCase";
import { GetVendorHotelsUseCase } from "../../../application/use-cases/vendor/hotel/getHotelsByVendorUseCase";
import { GetHotelAnalyticsUseCase } from "../../../application/use-cases/vendor/hotel/getHotelAnalyticsUseCase";
import { GetVendorHotelAnalyticsUseCase } from "../../../application/use-cases/vendor/getVendorHotelAnalyticsUseCase";
import { GetHotelDetailsWithRoomUseCase } from "../../../application/use-cases/vendor/hotel/getHotelDetailWithRoomUseCase";
import { GetTrendingHotelsUseCase } from "../../../application/use-cases/vendor/hotel/getTrendingHotelsUseCase";

import {
    ICreateHotelUseCase,
    IGetAllHotelsUseCase,
    IGetHotelAnalyticsUseCase,
    IGetHotelByIdUseCase,
    IGetHotelDetailWithRoomUseCase,
    IGetTrendingHotelsUseCase,
    IGetVendorHotelsUseCase,
    IUpdateHotelUseCase
} from "../../../domain/interfaces/model/hotel.interface";
import { TOKENS } from "../../../constants/token";
import { container } from "tsyringe";
import { IGetBookingsByHotelUseCase, IGetVendorHotelAnalyticsUseCase } from "../../../domain/interfaces/model/booking.interface";


container.register<ICreateHotelUseCase>(TOKENS.CreateHotelUseCase, {
    useClass: CreateHotelUseCase,
})

container.register<IUpdateHotelUseCase>(TOKENS.UpdateHotelUseCase, {
    useClass: UpdateHotelUseCase,
})

container.register<IGetHotelByIdUseCase>(TOKENS.GetHotelByIdUseCase, {
    useClass: GetHotelByIdUseCase,
})

container.register<IGetAllHotelsUseCase>(TOKENS.GetAllHotelsUseCase, {
    useClass: GetAllHotelsUseCase,
})

container.register<IGetVendorHotelsUseCase>(TOKENS.GetHotelsByVendorUseCase, {
    useClass: GetVendorHotelsUseCase,
})

container.register<IGetHotelAnalyticsUseCase>(TOKENS.GetHotelAnalyticsUseCase, {
    useClass: GetHotelAnalyticsUseCase,
})

container.register<IGetHotelDetailWithRoomUseCase>(TOKENS.GetHotelDetailsWithRoomUseCase, {
    useClass: GetHotelDetailsWithRoomUseCase,
})

container.register<IGetTrendingHotelsUseCase>(TOKENS.GetTrendingHotelsUseCase, {
    useClass: GetTrendingHotelsUseCase,
})

container.register<IGetBookingsByHotelUseCase>(TOKENS.GetBookingsByHotelUseCase, {
    useClass: GetBookingsByHotelUseCase,
})

container.register<IGetVendorHotelAnalyticsUseCase>(TOKENS.GetVendorHotelAnalyticsUseCase, {
    useClass: GetVendorHotelAnalyticsUseCase,
})