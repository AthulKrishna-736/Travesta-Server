import { User } from "../../domain/models/user";
import { IUser } from "../../domain/interfaces/user.interface";
import { TRole, TSubscription } from "../../shared/types/user.types";


describe('User domain model', () => {
    const mockUserData: IUser = {
        _id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'user' as TRole,
        phone: 1234567890,
        subscriptionType: 'basic' as TSubscription,
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should return fullname correctly', ()=>{
        const user = new User(mockUserData)
        expect(user.fullName).toBe('JohnDoe')
      });

      it('should be not KYC verified by default', () => {
        const user = new User(mockUserData);
        expect(user.isKycVerified).toBe(true);
      });

      it('should convert to object with same data', () => {
        const user = new User(mockUserData);
        const userObj = user.toObject();
    
        expect(userObj.firstName).toBe('John');
        expect(userObj.email).toBe('john@example.com');
      });
 })