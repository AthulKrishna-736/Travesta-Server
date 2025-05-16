

export interface IMailService {
    sendOtpEmail(email: string, otp: string, otpExpireAt: string): Promise<{ message: string; otpExpireAt: string }>;
    sendVendorRejectionEmail(email: string, reason: string): Promise<{ message: string }>;
}
