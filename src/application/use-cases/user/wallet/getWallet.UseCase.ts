import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../../constants/token';
import { IWalletRepository } from '../../../../domain/interfaces/repositories/walletRepo.interface';
import { IGetWalletUseCase } from '../../../../domain/interfaces/model/wallet.interface';
import { AppError } from '../../../../utils/appError';
import { HttpStatusCode } from '../../../../constants/HttpStatusCodes';
import { WALLET_RES_MESSAGES } from '../../../../constants/resMessages';
import { WALLET_ERROR_MESSAGES } from '../../../../constants/errorMessages';
import { TResponseWalletDTO } from '../../../../interfaceAdapters/dtos/wallet.dto';
import { ResponseMapper } from '../../../../utils/responseMapper';

@injectable()
export class GetWalletUseCase implements IGetWalletUseCase {
    constructor(
        @inject(TOKENS.WalletRepository) private _walletRepository: IWalletRepository
    ) { }

    async getUserWallet(userId: string): Promise<{ wallet: TResponseWalletDTO | null, message: string }> {
        const wallet = await this._walletRepository.findUserWallet(userId);

        if (!wallet) {
            throw new AppError(WALLET_ERROR_MESSAGES.notFound, HttpStatusCode.NOT_FOUND);
        }

        const mappedWallet = ResponseMapper.mapWalletToResponseDTO(wallet);

        return { wallet: mappedWallet, message: WALLET_RES_MESSAGES.getWallet };
    }
}
