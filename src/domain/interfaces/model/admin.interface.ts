import { IUser } from "./user.interface";


export interface IAdmin extends Pick<IUser, 'email' | 'password' | 'profileImage' | 'firstName' | 'lastName'> {

}