import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../constants/HttpStatusCodes";
import { IUser, TResponseUserData, TUpdateUserData } from "../interfaces/model/user.interface";

export interface IUserEntity {
    // Getters
    readonly id: string | undefined;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
    readonly phone: number;
    readonly role: string;
    readonly isBlocked: boolean;
    readonly isGoogleUser: boolean;
    readonly isVerified: boolean;
    readonly profileImage: string | undefined;
    readonly kycDocuments: string[] | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    // Domain business logic
    block(): void;
    unblock(): void;
    updateProfile(data: TUpdateUserData): void;
    isAdmin(): boolean;
    verify(): void;
    unVerify(): void;
    googleUser(): void;

    // Return raw object (for persistence)
    toObject(): TResponseUserData;
    getPersistableData(): Partial<Omit<IUser, "_id" | "createdAt" | 'subscription'>>;
    getUpdatedSubscription(): Pick<IUser, 'subscription'>;
}


export class UserEntity implements IUserEntity {
    private _props: IUser

    constructor(data: IUser) {
        this._props = data
    }

    //getter for user resource
    get id() {
        return this._props._id
    }

    get firstName() {
        return this._props.firstName;
    }

    get lastName() {
        return this._props.lastName;
    }

    get email() {
        return this._props.email;
    }

    get password() {
        return this._props.password;
    }

    get phone() {
        return this._props.phone;
    }

    get role() {
        return this._props.role;
    }

    get isBlocked() {
        return this._props.isBlocked;
    }

    get isVerified() {
        return this._props.isVerified;
    }

    get isGoogleUser() {
        return this._props.isGoogle;
    }

    get subscription() {
        return this._props.subscription;
    }

    get profileImage() {
        return this._props.profileImage;
    }

    get kycDocuments() {
        return this._props.kycDocuments;
    }

    get createdAt() {
        return this._props.createdAt;
    }

    get updatedAt() {
        return this._props.updatedAt;
    }

    //admin business logic

    block(): void {
        if (this._props.isBlocked) {
            throw new AppError('User is already blocked', HttpStatusCode.CONFLICT);
        }

        this._props.isBlocked = true;
        this._props.updatedAt = new Date();
    }

    unblock(): void {
        if (!this._props.isBlocked) {
            throw new AppError('User is not blocked', HttpStatusCode.CONFLICT);
        }

        this._props.isBlocked = false;
        this._props.updatedAt = new Date();
    }

    verify(): void {
        if (this._props.isVerified) {
            throw new AppError('User is already verified', HttpStatusCode.CONFLICT)
        }
        this._props.isVerified = true;
        this._props.updatedAt = new Date();
    }

    unVerify(): void {
        if (!this._props.isVerified) {
            throw new AppError('User is not verified', HttpStatusCode.CONFLICT);
        }
        this._props.isVerified = false;
        this._props.updatedAt = new Date();
    }

    //user business logic
    updateProfile(data: TUpdateUserData): void {
        if (data.firstName && typeof data.firstName === 'string' && data.firstName.trim().length > 0) {
            this._props.firstName = data.firstName.trim();
        }
        if (data.lastName && typeof data.lastName === 'string' && data.lastName.trim().length > 0) {
            this._props.lastName = data.lastName.trim();
        }
        if (data.password && typeof data.password === 'string' && data.password.trim().length > 0) {
            this._props.password = data.password.trim();
        }
        if (data.phone && ((typeof data.phone === 'string' && /^\d+$/.test(data.phone)) || (typeof data.phone === 'number' && data.phone > 0))) {
            this._props.phone = Number(data.phone);
        }
        if (data.profileImage && typeof data.profileImage === 'string' && data.profileImage.trim().length > 0) {
            this._props.profileImage = data.profileImage.trim();
        }
        if (data.kycDocuments && Array.isArray(data.kycDocuments) && data.kycDocuments.length > 0) {
            this._props.kycDocuments = [...data.kycDocuments];
        }
        this._props.updatedAt = new Date();
    }

    googleUser(): void {
        if (this._props.isGoogle) {
            throw new AppError('Already google user', HttpStatusCode.CONFLICT);
        }

        this._props.isGoogle = true;
    }

    isAdmin(): boolean {
        return this._props.role == 'admin';
    }

    toObject(): TResponseUserData {
        return {
            _id: this._props._id,
            firstName: this._props.firstName,
            lastName: this._props.lastName,
            email: this._props.email,
            password: this._props.password,
            isGoogle: this._props.isGoogle,
            phone: this._props.phone,
            isBlocked: this._props.isBlocked,
            role: this._props.role,
            subscription: this._props.subscription,
            profileImage: this._props.profileImage,
            isVerified: this._props.isVerified,
            verificationReason: this._props.verificationReason,
            kycDocuments: this._props.kycDocuments ?? [],
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt,
        };
    }

    getPersistableData(): Partial<Omit<IUser, "_id" | "createdAt" | 'subscription'>> {
        return {
            firstName: this._props.firstName,
            lastName: this._props.lastName,
            phone: this._props.phone,
            password: this._props.password,
            role: this._props.role,
            isBlocked: this._props.isBlocked,
            isVerified: this._props.isVerified,
            isGoogle: this._props.isGoogle,
            profileImage: this._props.profileImage,
            kycDocuments: this._props.kycDocuments,
            updatedAt: this._props.updatedAt,
        };
    }

    getUpdatedSubscription(): Pick<IUser, 'subscription'> {
        if (!this._props.subscription) {
            throw new AppError('Subscription not found', HttpStatusCode.NOT_FOUND);
        }
        return { subscription: this._props.subscription };
    }
}