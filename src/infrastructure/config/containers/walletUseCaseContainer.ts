import { container } from "tsyringe";
import { TOKENS } from "../../../constants/token";

import { GetWalletUseCase } from "../../../application/use-cases/user/wallet/getWallet.UseCase";
import { CreateWalletUseCase } from "../../../application/use-cases/user/wallet/createWallet.UseCase";
import { BookingTransactionUseCase } from "../../../application/use-cases/user/wallet/bookingTransaction.UseCase";
import { AddMoneyToWalletUseCase } from "../../../application/use-cases/user/wallet/addMoneyTransaction.UseCase";
import { GetTransactionsUseCase } from "../../../application/use-cases/user/wallet/getTransactions.UseCase";

import {
    IAddMoneyToWalletUseCase,
    IBookingTransactionUseCase,
    ICreateWalletUseCase,
    IGetTransactionsUseCase,
    IGetWalletUseCase,
    IHandleStripeWebhookUseCase
} from "../../../domain/interfaces/model/wallet.interface";
import { HandleStripeWebhookUseCase } from "../../../application/use-cases/user/wallet/handleWebHook.UseCase";


container.register<IGetWalletUseCase>(TOKENS.GetWalletUseCase, {
    useClass: GetWalletUseCase,
})

container.register<ICreateWalletUseCase>(TOKENS.CreateWalletUseCase, {
    useClass: CreateWalletUseCase,
})

container.register<IBookingTransactionUseCase>(TOKENS.BookingTransactionUseCase, {
    useClass: BookingTransactionUseCase,
});

container.register<IAddMoneyToWalletUseCase>(TOKENS.AddMoneyToWalletUseCase, {
    useClass: AddMoneyToWalletUseCase,
})

container.register<IGetTransactionsUseCase>(TOKENS.GetTransactionsUseCase, {
    useClass: GetTransactionsUseCase,
});

container.register<IHandleStripeWebhookUseCase>(TOKENS.HandleStripeWebhookUseCase, {
    useClass: HandleStripeWebhookUseCase,
})