import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreateRatingUseCase } from "../../../application/use-cases/rating/createRatingUseCase";
import { UpdateRatingUseCase } from "../../../application/use-cases/rating/updateRatingUseCase";
import { GetRatingUseCase } from "../../../application/use-cases/rating/getRatingsUseCase";

import {
    ICreateRatingUseCase,
    IGetRatingUseCase,
    IUpdateRatingUseCase
} from "../../../domain/interfaces/model/rating.interface";


container.register<ICreateRatingUseCase>(TOKENS.CreateRatingUseCase, {
    useClass: CreateRatingUseCase,
})

container.register<IUpdateRatingUseCase>(TOKENS.UpdateRatingUseCase, {
    useClass: UpdateRatingUseCase,
})

container.register<IGetRatingUseCase>(TOKENS.GetRatingsUseCase, {
    useClass: GetRatingUseCase,
})

