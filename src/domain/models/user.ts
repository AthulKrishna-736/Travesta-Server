import { TRole, TSubscription } from "../../shared/types/user.types";
import { IUser } from "../interfaces/user.interface";



export class User {
    private props: IUser;

    constructor(props: IUser) {
        this.props = props
    }  

    get id(): string | undefined {
        return this.props._id
    } 

    get email(): string {
        return this.props.email
    }

    get fullName(): string {
        return `${this.props.firstName}${this.props.lastName}`
    }

    get role(): TRole{
        return this.props.role;
    }

    get subscription(): TSubscription {
        return this.props.subscriptionType
    }

    get isKycVerified(): boolean {
        return this.props.isKycVerified ?? false
    }

    get createdAt(): Date {
        return this.props.createdAt
    }

    get updatedAt(): Date {
        return this.props.updatedAt
    }

    public verifyKyc(): void {
        this.props.isKycVerified = true
        this.updateTimestamp()
    }

    public changeSubscription(type: TSubscription): void {
        this.props.subscriptionType = type
        this.updateTimestamp()
    }

    public updateName(firstName: string, lastName: string): void {
        this.props.firstName = firstName
        this.props.lastName = lastName
        this.updateTimestamp()
    }

    public setProfileImage(image: string): void {
        this.props.profileImage = image
        this.updateTimestamp()
    }

    public toObject(): IUser {
        return { ...this.props }
    }

    private updateTimestamp(): void {
        this.props.updatedAt = new Date()
    }
}