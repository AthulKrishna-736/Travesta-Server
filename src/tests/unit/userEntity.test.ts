import { AppError } from "../../../src/utils/appError";
import { UserEntity } from "../../domain/entities/user/user.entity";
import { IUser } from "../../domain/interfaces/model/user.interface";

const sampleUser: IUser = {
    _id: "abc123",
    firstName: "John",
    lastName: "Doe",
    isGoogle: false,
    email: "john@example.com",
    password: "hashedPassword",
    role: "user",
    phone: 1234567890,
    isBlocked: false,
    isVerified: false,
    wishlist: [],
    subscription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('UserEntity', () => {

    it('should create entity and expose props', () => {
        const entity = new UserEntity(sampleUser);
        expect(entity.firstName).toBe("John");
        expect(entity.isBlocked).toBe(false);
    });

    it('should block and unblock correctly', () => {
        const entity = new UserEntity({ ...sampleUser });
        entity.block();
        expect(entity.isBlocked).toBe(true);
        expect(() => entity.block()).toThrow(AppError);
        entity.unblock();
        expect(entity.isBlocked).toBe(false);
        expect(() => entity.unblock()).toThrow(AppError);
    });

    it('should verify and unverify correctly', () => {
        const entity = new UserEntity({ ...sampleUser });
        entity.verify();
        expect(entity.isVerified).toBe(true);
        expect(() => entity.verify()).toThrow(AppError);
        entity.unVerify();
        expect(entity.isVerified).toBe(false);
    });

    it('should update profile fields safely', () => {
        const entity = new UserEntity({ ...sampleUser });
        entity.updateProfile({ firstName: "Jane", phone: 987654321 });
        expect(entity.firstName).toBe("Jane");
        expect(entity.phone).toBe(987654321);
    });

    it('should subscribe to a plan', () => {
        const entity = new UserEntity({ ...sampleUser });
        const planId = "plan123";
        const from = new Date();
        const until = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        entity.subscribe(planId, from, until);
        expect(entity.subscription).toEqual({
            plan: planId,
            validFrom: from,
            validUntil: until,
        });
    });

    it('should throw on subscribe if no planId', () => {
        const entity = new UserEntity({ ...sampleUser });
        expect(() => entity.subscribe("", new Date(), new Date())).toThrow(AppError);
    });

    it('should getUpdatedSubscription or throw if not set', () => {
        const entity = new UserEntity({ ...sampleUser });
        expect(() => entity.getUpdatedSubscription()).toThrow(AppError);
        entity.subscribe("planX", new Date(), new Date());
        const sub = entity.getUpdatedSubscription();
        expect(sub.subscription).toBeDefined();
    });

});
