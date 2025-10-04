import { Types } from "mongoose";

//rating model
export interface IRating {
    _id?: string;
    hotelId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    hospitality: number;
    cleanliness: number;
    facilities: number;
    room: number;
    moneyValue: number;
    createdAt: Date;
    updatedAt: Date;
}
