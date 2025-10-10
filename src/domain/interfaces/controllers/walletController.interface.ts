import { NextFunction, Response } from "express"
import { CustomRequest } from "../../../utils/customRequest"

export interface IWalletController {
    createWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    createPaymentIntent(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    BookingConfirmTransaction(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    AddMoneyTransaction(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    getTransactions(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    subscriptionConfirmTransaction(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}