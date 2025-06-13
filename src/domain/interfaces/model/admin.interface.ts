import { IUser } from "./user.interface";


export interface IAdmin extends Pick<IUser, 'email' | 'password' | 'profileImage' | 'firstName' | 'lastName'> { };

export interface IAmenities {
    _id: string
    name: string
    type: 'hotel' | 'room'
    description: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}