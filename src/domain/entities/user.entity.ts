import { AppError } from "../../utils/appError";
import { HttpStatusCode } from "../../utils/HttpStatusCodes";
import { IUser } from "../interfaces/model/user.interface";

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
    readonly wishlist: string[];
    readonly subscriptionType: string;
    readonly profileImage: string | undefined;
    readonly kycDocuments: string[] | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    // Domain business logic
    block(): void;
    unblock(): void;
    updateProfile(data: Partial<Pick<IUser, 'firstName' | 'lastName' | 'phone' | 'profileImage' | 'kycDocuments'>>): void;
    isAdmin(): boolean;
    verify(): void;
    unVerify(): void;
    googleUser(): void

    // Return raw object (for persistence)
    toObject(): Omit<IUser, 'password'>;
    getPersistableData(): Partial<Omit<IUser, "_id" | "createdAt">>
}


export class UserEntity implements IUserEntity {
    private _user: IUser

    constructor(data: IUser) {
        this._user = data
    }

    //getter for user resource
    get id() {
        return this._user._id
    }

    get firstName() {
        return this._user.firstName;
    }

    get lastName() {
        return this._user.lastName;
    }

    get email() {
        return this._user.email;
    }

    get password() {
        return this._user.password;
    }

    get phone() {
        return this._user.phone;
    }

    get role() {
        return this._user.role;
    }

    get isBlocked() {
        return this._user.isBlocked;
    }

    get isVerified() {
        return this._user.isVerified;
    }

    get isGoogleUser() {
        return this._user.isGoogle;
    }

    get wishlist() {
        return this._user.wishlist;
    }

    get subscriptionType() {
        return this._user.subscriptionType;
    }

    get profileImage() {
        return this._user.profileImage;
    }

    get kycDocuments() {
        return this._user.kycDocuments;
    }

    get createdAt() {
        return this._user.createdAt;
    }

    get updatedAt() {
        return this._user.updatedAt;
    }

    //admin business logic

    block(): void {
        if (this._user.isBlocked) {
            throw new AppError('User is already blocked', HttpStatusCode.CONFLICT);
        }

        this._user.isBlocked = true;
        this._user.updatedAt = new Date();
    }

    unblock(): void {
        if (!this._user.isBlocked) {
            throw new AppError('User is not blocked', HttpStatusCode.CONFLICT);
        }

        this._user.isBlocked = false;
        this._user.updatedAt = new Date();
    }

    verify(): void {
        if (this._user.isVerified) {
            throw new AppError('User is already verified', HttpStatusCode.CONFLICT)
        }
        this._user.isVerified = true;
        this._user.updatedAt = new Date();
    }

    unVerify(): void {
        if (!this._user.isVerified) {
            throw new AppError('User is not verified', HttpStatusCode.CONFLICT);
        }
        this._user.isVerified = false;
        this._user.updatedAt = new Date();
    }

    //user business logic
    updateProfile(data: Partial<Pick<IUser, 'firstName' | 'lastName' | 'phone' | 'password' | 'profileImage' | 'kycDocuments'>>): void {
        if (data.firstName && data.firstName.trim().length > 0 && typeof data.firstName == 'string') {
            this._user.firstName = data.firstName
        }
        if (data.lastName && data.lastName.trim().length > 0 && typeof data.lastName == 'string') {
            this._user.lastName = data.lastName
        }
        if (data.password && data.password.trim().length > 0 && typeof data.lastName == 'string') {
            this._user.password = data.password
        }
        if (data.phone  && data.phone) {
            this._user.phone = data.phone
        }
        if (data.profileImage) this._user.profileImage = data.profileImage
        if (data.kycDocuments && data.kycDocuments.length > 0) {
            this._user.kycDocuments = [...data.kycDocuments]
        }
        this._user.updatedAt = new Date();
    }

    googleUser(): void {
        if (this._user.isGoogle) {
            throw new AppError('Already google user', HttpStatusCode.CONFLICT);
        }

        this._user.isGoogle = true;
    }

    isAdmin(): boolean {
        return this._user.role == 'admin';
    }

    toObject(): Omit<IUser, 'password'> {
        return {
            _id: this._user._id,
            firstName: this._user.firstName,
            lastName: this._user.lastName,
            email: this._user.email,
            isGoogle: this._user.isGoogle,
            phone: this._user.phone,
            isBlocked: this._user.isBlocked,
            role: this._user.role,
            subscriptionType: this._user.subscriptionType,
            profileImage: this._user.profileImage,
            wishlist: this._user.wishlist ?? [],
            isVerified: this._user.isVerified,
            verificationReason: this._user.verificationReason,
            kycDocuments: this._user.kycDocuments ?? [],
            createdAt: this._user.createdAt,
            updatedAt: this._user.updatedAt,
        };
    }

    getPersistableData(): Partial<Omit<IUser, "_id" | "createdAt">> {
        return {
            firstName: this._user.firstName,
            lastName: this._user.lastName,
            phone: this._user.phone,
            role: this._user.role,
            isBlocked: this._user.isBlocked,
            isVerified: this._user.isVerified,
            isGoogle: this._user.isGoogle,
            wishlist: this._user.wishlist,
            subscriptionType: this._user.subscriptionType,
            profileImage: this._user.profileImage,
            kycDocuments: this._user.kycDocuments,
            updatedAt: this._user.updatedAt,
        };
    }
}