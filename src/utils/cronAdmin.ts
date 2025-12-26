import mongoose from "mongoose";
import cron from "node-cron";
import { nanoid } from "nanoid";
import { injectable, inject } from "tsyringe";
import { BookingRepository } from "../infrastructure/database/repositories/bookingRepo";
import { WalletRepository } from "../infrastructure/database/repositories/walletRepo";
import { NotificationRepository } from "../infrastructure/database/repositories/notificationRepo";
import { transactionModel } from "../infrastructure/database/models/transactionModel";
import { TOKENS } from "../constants/token";
import { IPlatformFeeService } from "../domain/interfaces/model/admin.interface";

@injectable()
export class PlatformFeeService implements IPlatformFeeService {
    constructor(
        @inject(TOKENS.BookingRepository) private bookingRepo: BookingRepository,
        @inject(TOKENS.WalletRepository) private walletRepo: WalletRepository,
        @inject(TOKENS.NotificationRepository) private notificationRepo: NotificationRepository
    ) { }

    public async settlePlatformFee() {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const bookings = await this.bookingRepo.findBookingsForPlatformFee();
            if (!bookings.length) {
                await session.commitTransaction();
                return;
            }

            const adminWallet = await this.walletRepo.findAdminWallet();
            if (!adminWallet) throw new Error("Admin wallet not found");

            for (const booking of bookings) {
                const vendorId = (booking.hotelId as any).vendorId;
                const vendorWallet = await this.walletRepo.findUserWallet(vendorId);
                if (!vendorWallet) continue;

                const platformFee = booking.totalPrice * 0.1;
                if (platformFee <= 0) continue;

                await this.walletRepo.updateBalance(vendorWallet._id!, -platformFee, session);
                await this.walletRepo.updateBalance(adminWallet._id!, platformFee, session);

                await transactionModel.insertMany([
                    {
                        walletId: vendorWallet._id,
                        type: "debit",
                        amount: platformFee,
                        description: `Platform fee for booking ${booking.bookingId}`,
                        transactionId: `TRN-${nanoid(10)}`,
                        relatedEntityId: booking._id,
                        relatedEntityType: "Booking",
                    },
                    {
                        walletId: adminWallet._id,
                        type: "credit",
                        amount: platformFee,
                        description: `Platform commission from booking ${booking.bookingId}`,
                        transactionId: `TRN-${nanoid(10)}`,
                        relatedEntityId: booking._id,
                        relatedEntityType: "Booking",
                    },
                ], { session });

                await this.bookingRepo.markBookingSettled(booking._id!, session);

                await this.notificationRepo.createNotification({
                    userId: adminWallet.userId.toString(),
                    title: "Platform Fee Settled",
                    message: `₹${platformFee} has been collected as platform fee from booking ${booking.bookingId}.`,
                }, session);

                await this.notificationRepo.createNotification({
                    userId: vendorWallet.userId.toString(),
                    title: "Platform Fee Deducted",
                    message: `₹${platformFee} has been deducted as platform fee from your booking ${booking.bookingId}.`,
                }, session);
            }

            await session.commitTransaction();
            console.log("Platform fee cron completed successfully");
        } catch (err) {
            await session.abortTransaction();
            console.error("Platform fee cron failed", err);
        } finally {
            session.endSession();
        }
    }

    public scheduleCron() {
        cron.schedule("0 0 * * *", async () => {
            console.log("Running platform fee cron job...");
            await this.settlePlatformFee();
        }, {
            timezone: "Asia/Kolkata",
        });
    }
}
