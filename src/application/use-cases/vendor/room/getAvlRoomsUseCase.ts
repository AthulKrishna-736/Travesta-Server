@injectable()
export class GetAvailableRoomsByHotelUseCase {
    constructor(
        @inject(TOKENS.RoomRepository) private _roomRepo: IRoomRepository
    ) { }

    async execute(hotelId: string): Promise<IRoom[]> {
        const availableRooms = await this._roomRepo.findAvailableRoomsByHotelId(hotelId);

        return availableRooms;
    }
}
