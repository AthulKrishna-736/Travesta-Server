@injectable()
export class GetRoomByIdUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepo: IRoomRepository
    ) { }

    async execute(roomId: string): Promise<IRoom> {
        const room = await this._roomRepo.findRoomById(roomId);

        if (!room) {
            throw new AppError("Room not found", HttpStatusCode.NOT_FOUND);
        }

        return room;
    }
}