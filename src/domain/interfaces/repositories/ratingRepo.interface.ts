import { IRating } from "../model/rating.interface";

export interface IRatingRepository {
    create(): Promise<IRating>;
    update(): Promise<IRating>;
    getAllRatings(): Promise<IRating[] | null>;
    getUserRatings(): Promise<IRating | null>;
}