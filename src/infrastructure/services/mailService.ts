import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { AppError } from '../../utils/appError';
import { HttpStatusCode } from '../../utils/HttpStatusCodes';
import { injectable } from 'tsyringe';

@injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    constructor() {
        if (env.EMAIL || env.EMAIL_PASS) {
            throw new AppError('Missing email or email pass from environment varibles', HttpStatusCode.BAD_REQUEST);
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: env.EMAIL,
                pass: env.EMAIL_PASS,
            }
        });
    }

    async sendOtpEmail(email: string, otp: string, otpExpireAt: Date): Promise<{ message: string, otpExpireAt: Date }> {
        try {
            const html = `
                    <div style="font-family: 'Inter', sans-serif; max-width: 550px; margin: 40px auto; padding: 30px; border-radius: 12px; background: linear-gradient(135deg, #ffffff 0%, #e6f0ff 100%); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); border: 1px solid #d0e4ff; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle, rgba(74, 144, 226, 0.2) 10%, transparent 10%); background-size: 20px 20px; opacity: 0.5; z-index: 0;"></div>
                    <h2 style="color: #1e3a8a; text-align: center; font-size: 28px; font-weight: 700; margin-bottom: 20px; letter-spacing: 1px; text-transform: uppercase; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);">Your Verification Code</h2>
                    <p style="font-size: 16px; color: #334155; text-align: center; margin-bottom: 25px; line-height: 1.5;">Enter the code below to complete your signup process securely:</p>
                    <div style="display: flex; justify-content: center; align-items: center; margin: 0 auto; padding: 15px 20px; border-radius: 10px; background: linear-gradient(90deg, #4a90e2 0%, #2563eb 100%); color: #ffffff; font-size: 32px; font-weight: 600; letter-spacing: 6px; text-align: center; transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: default; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.3)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.2)';">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px; opacity: 0.8;">This code expires in 10 minutes. Do not share it with anyone.</p>
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

}