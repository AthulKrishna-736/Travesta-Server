import mongoose from "mongoose";
import cron from "node-cron";
import { nanoid } from "nanoid";
import { BookingRepository } from "../infrastructure/database/repositories/bookingRepo";
import { WalletRepository } from "../infrastructure/database/repositories/wallet.Repo";
import { NotificationRepository } from "../infrastructure/database/repositories/notificationRepo";
import { transactionModel } from "../infrastructure/database/models/transactionModel";

export const settlePlatformFeeCron = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingRepo = new BookingRepository();
        const walletRepo = new WalletRepository();
        const notificationRepo = new NotificationRepository();

        // Fetch bookings that are not yet settled
        const bookings = await bookingRepo.findBookingsForPlatformFee();
        if (!bookings.length) {
            await session.commitTransaction();
            return;
        }

        const adminWallet = await walletRepo.findAdminWallet();
        if (!adminWallet) throw new Error("Admin wallet not found");

        for (const booking of bookings) {
            const vendorId = (booking.hotelId as any).vendorId;
            const vendorWallet = await walletRepo.findUserWallet(vendorId);
            if (!vendorWallet) continue;

            const platformFee = booking.totalPrice * 0.1;
            if (platformFee <= 0) continue;

            await walletRepo.updateBalanceByWalletId(vendorWallet._id!, -platformFee);
            await walletRepo.updateBalanceByWalletId(adminWallet._id!, platformFee);

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

            // Mark booking as settled
            await bookingRepo.markBookingSettled(booking._id!, session);

            await notificationRepo.createNotification({
                userId: adminWallet.userId.toString(),
                title: "Platform Fee Settled",
                message: `₹${platformFee} has been collected as platform fee from booking ${booking.bookingId}.`,
            }, session);

            await notificationRepo.createNotification({
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
};

cron.schedule("0 0 * * *", async () => {
    console.log("Running platform fee cron job...");
    await settlePlatformFeeCron();
}, {
    timezone: "Asia/Kolkata"
});