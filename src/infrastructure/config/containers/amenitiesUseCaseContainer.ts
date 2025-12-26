import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreateAmenityUseCase } from "../../../application/use-cases/amenities/createAmenityUseCase";
import { UpdateAmenityUseCase } from "../../../application/use-cases/amenities/updateAmenityUseCase";
import { BlockUnblockAmenity } from "../../../application/use-cases/amenities/blockUnblockAmenityUseCase";
import { GetAmenityByIdUseCase } from "../../../application/use-cases/amenities/getAmenityByIdUseCase";
import { GetAllAmenitiesUseCase } from "../../../application/use-cases/amenities/getAllAmenitiesUseCase";
import { GetActiveAmenitiesUseCase } from "../../../application/use-cases/amenities/getActiveAmenitiesUseCase";
import { FindUsedActiveAmenitiesUseCase } from "../../../application/use-cases/amenities/getUserActiveAmenitiesUseCase";

import {
  IBlockUnblockAmenityUseCase,
  ICreateAmenityUseCase,
  IFindUsedActiveAmenitiesUseCase,
  IGetActiveAmenitiesUseCase,
  IGetAllAmenitiesUseCase,
  IGetAmenityByIdUseCase,
  IUpdateAmenityUseCase
} from "../../../domain/interfaces/model/amenities.interface";


container.register<ICreateAmenityUseCase>(TOKENS.CreateAmenityUseCase, {
    useClass: CreateAmenityUseCase,
})

container.register<IUpdateAmenityUseCase>(TOKENS.UpdateAmenityUseCase, {
    useClass: UpdateAmenityUseCase,
})

container.register<IBlockUnblockAmenityUseCase>(TOKENS.BlockUnblockAmenityUseCase, {
    useClass: BlockUnblockAmenity,
})

container.register<IGetAmenityByIdUseCase>(TOKENS.GetAmenityByIdUseCase, {
    useClass: GetAmenityByIdUseCase,
})

container.register<IGetAllAmenitiesUseCase>(TOKENS.GetAllAmenitiesUseCase, {
    useClass: GetAllAmenitiesUseCase,
})

container.register<IGetActiveAmenitiesUseCase>(TOKENS.GetActiveAmenitiesUseCase, {
    useClass: GetActiveAmenitiesUseCase,
})

container.register<IFindUsedActiveAmenitiesUseCase>(TOKENS.FindUsedActiveAmenitiesUseCase, {
    useClass: FindUsedActiveAmenitiesUseCase,
})