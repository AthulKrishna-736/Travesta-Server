import { IUser } from "./user.interface";

export interface IAdmin extends Pick<IUser, 'email' | 'password' | 'profileImage' | 'firstName' | 'lastName'> { };

export interface IPlatformFeeService {
    settlePlatformFee(): Promise<void>;
    scheduleCron(): void;
}

export interface ISocketService {
    totalClients: number;
}