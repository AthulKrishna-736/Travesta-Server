import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreateRoomUseCase } from "../../../application/use-cases/vendor/room/createRoomUseCase";
import { UpdateRoomUseCase } from "../../../application/use-cases/vendor/room/updateRoomUseCase";
import { GetRoomByIdUseCase } from "../../../application/use-cases/vendor/room/getRoomByIdUseCase";
import { GetAllRoomsUseCase } from "../../../application/use-cases/vendor/room/getAllRoomsUseCase";

import {
    ICreateRoomUseCase,
    IGetAllRoomsUseCase,
    IGetRoomByIdUseCase,
    IUpdateRoomUseCase
} from "../../../domain/interfaces/model/room.interface";


container.register<ICreateRoomUseCase>(TOKENS.CreateRoomUseCase, {
    useClass: CreateRoomUseCase,
})

container.register<IUpdateRoomUseCase>(TOKENS.UpdateRoomUseCase, {
    useClass: UpdateRoomUseCase,
})

container.register<IGetRoomByIdUseCase>(TOKENS.GetRoomByIdUseCase, {
    useClass: GetRoomByIdUseCase,
})

container.register<IGetAllRoomsUseCase>(TOKENS.GetAllRoomsUseCase, {
    useClass: GetAllRoomsUseCase,
})
