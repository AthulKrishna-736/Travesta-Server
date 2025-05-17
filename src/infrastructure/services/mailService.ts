import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../../utils/appError';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { injectable } from 'tsyringe';
import { IMailService } from '../../domain/services/mailService.interface';

@injectable()
export class MailService implements IMailService{
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.EMAIL,
                pass: env.EMAIL_PASS,
            }
        });
    }

    async sendOtpEmail(email: string, otp: string, otpExpireAt: string): Promise<{ message: string, otpExpireAt: string }> {
        try {
            const html = `
                <div style="font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; padding: 30px; max-width: 520px; margin: 50px auto; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
                    <h2 style="text-align: center; color: #0f172a; font-size: 26px; margin-bottom: 10px;">🔐 OTP Verification</h2>
                    
                    <p style="color: #334155; font-size: 16px; text-align: center; margin-bottom: 25px;">
                        Use the code below to verify your identity. This ensures that only you can access your account.
                    </p>

                    <div style="background: #f1f5f9; border-radius: 10px; padding: 18px; text-align: center; font-size: 36px; color: #1e40af; letter-spacing: 10px; font-weight: bold; margin: 0 auto 25px; width: fit-content; border: 2px dashed #93c5fd;">
                        ${otp}
                    </div>

                    <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 12px;">
                        This OTP is valid for <strong>${otpExpireAt} minutes</strong>.
                    </p>

                    <p style="font-size: 13px; color: #94a3b8; text-align: center;">
                        If you didn’t request this, you can ignore this message. Do not share this code with anyone.
                    </p>

                    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #cbd5e1;">
                        &mdash; Travesta Security Team
                    </div>
                </div>
                `;

            const mailOption = {
                from: env.EMAIL,
                to: email,
                subject: 'Your Verification Code for Travesta',
                html
            }

            await this.transporter.sendMail(mailOption)

            return {
                message: 'Otp sent successfully',
                otpExpireAt
            }
        } catch (error: any) {
            throw new AppError('Failed to send OTP email. Please try again later.', HttpStatusCode.BAD_REQUEST);
        }
    }


    async sendVendorRejectionEmail(email: string, reason: string): Promise<{ message: string }> {
        try {
            const html = `
                <div style="font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; padding: 30px; max-width: 520px; margin: 50px auto; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
                    <h2 style="text-align: center; color: #b91c1c; font-size: 24px; margin-bottom: 10px;">❌ Vendor Verification Rejected</h2>
                    
                    <p style="color: #334155; font-size: 16px; text-align: center; margin-bottom: 20px;">
                        Your request to become a verified vendor has been <strong>rejected</strong>.
                    </p>
    
                    <div style="background: #fef2f2; border-radius: 10px; padding: 15px; font-size: 14px; color: #991b1b; margin-bottom: 20px;">
                        <strong>Reason:</strong> ${reason}
                    </div>
    
                    <p style="font-size: 13px; color: #64748b; text-align: center;">
                        If you believe this was a mistake or need clarification, please contact support.
                    </p>
    
                    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #cbd5e1;">
                        &mdash; Travesta Admin Team
                    </div>
                </div>
            `;
    
            const mailOption = {
                from: env.EMAIL,
                to: email,
                subject: 'Vendor Verification Rejected – Travesta',
                html
            }
    
            await this.transporter.sendMail(mailOption);
    
            return {
                message: 'Vendor rejection email sent successfully'
            };
        } catch (error: any) {
            throw new AppError('Failed to send rejection email.', HttpStatusCode.BAD_REQUEST);
        }
    }
    

}