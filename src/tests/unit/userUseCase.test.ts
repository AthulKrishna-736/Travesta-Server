import { IAuthService } from "../../application/interfaces/authService.interface";
import { LoginUser } from "../../application/use-cases/auth/loginUser";
import { IUser, IUserRepository } from "../../domain/interfaces/user.interface";


describe("LoginUser Use Case", () => {
    const mockUser: IUser = {
      _id: "123",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "hashedpass",
      role: "user",
      phone: 1234567890,
      subscriptionType: "basic",
      wishlist: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    const userRepository: IUserRepository = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
    } as any;
  
    const authService: IAuthService = {
      comparePassword: jest.fn().mockResolvedValue(true),
      generateToken: jest.fn().mockReturnValue("mocktoken"),
    } as any;
  
    const loginUser = new LoginUser(userRepository, authService);
  
    it("should login user successfully", async () => {
      const result = await loginUser.execute("test@example.com", "123456");
  
      expect(userRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(authService.comparePassword).toHaveBeenCalled();
      expect(authService.generateToken).toHaveBeenCalledWith("123");
      expect(result).toEqual({ token: "mocktoken", user: mockUser });
    });
  
    it("should throw error if user not found", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(null);
  
      await expect(loginUser.execute("wrong@example.com", "123456"))
        .rejects
        .toThrow("User not found");
    });
  });