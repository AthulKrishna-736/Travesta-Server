import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreateOfferUseCase } from "../../../application/use-cases/offer/createOfferUseCase";
import { UpdateOfferUseCase } from "../../../application/use-cases/offer/updateOfferUseCase";
import { GetVendorOffersUseCase } from "../../../application/use-cases/offer/getVendorOfferUseCase";
import { DetectOfferForRoomUseCase } from "../../../application/use-cases/offer/detectOffersForRoomUseCast";
import { ToggleOfferStatusUseCase } from "../../../application/use-cases/offer/toggleOfferStatusUseCase";

import {
    ICreateOfferUseCase,
    IDetectOfferForRoomUseCase,
    IGetVendorOffersUseCase,
    IToggleOfferStatusUseCase,
    IUpdateOfferUseCase
} from "../../../domain/interfaces/model/offer.interface";


container.register<ICreateOfferUseCase>(TOKENS.CreateOfferUseCase, {
    useClass: CreateOfferUseCase,
})

container.register<IUpdateOfferUseCase>(TOKENS.UpdateOfferUseCase, {
    useClass: UpdateOfferUseCase,
})

container.register<IGetVendorOffersUseCase>(TOKENS.GetVendorOffersUseCase, {
    useClass: GetVendorOffersUseCase,
})

container.register<IDetectOfferForRoomUseCase>(TOKENS.DetectOfferForRoomUseCase, {
    useClass: DetectOfferForRoomUseCase,
})

container.register<IToggleOfferStatusUseCase>(TOKENS.ToggleOfferStatusUseCase, {
    useClass: ToggleOfferStatusUseCase,
})