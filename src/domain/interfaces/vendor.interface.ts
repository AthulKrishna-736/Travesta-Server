import { IUser } from "./user.interface";

export interface IVendor extends Omit<IUser, 'wishlist' | 'subscription'> {

}