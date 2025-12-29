import { container } from "tsyringe";
import { BlockUnblockUser } from "../../../application/use-cases/admin/blockUser";
import { GetAllUsers } from "../../../application/use-cases/admin/getAllUsers";
import { GetAllVendorReq } from "../../../application/use-cases/admin/getAllVendorReq";
import { UpdateVendorReq } from "../../../application/use-cases/admin/updateVendorReq";
import { GetAdminAnalyticsUseCase } from "../../../application/use-cases/vendor/getAdminAnalyticsUseCase";
import { UpdateUser } from "../../../application/use-cases/common/updateUserProfle";
import { GetUserProfileUseCase } from "../../../application/use-cases/user/getUser";
import { UpdateKycUseCase } from "../../../application/use-cases/vendor/updateKyc";
import { GetVendorProfileUseCase } from "../../../application/use-cases/vendor/getVendor";

import {
    IBlockUnblockUser,
    IGetAllUsersUseCase,
    IGetAllVendorReqUseCase,
    IGetUserUseCase,
    IGetVendorUseCase,
    IUpdateKycUseCase,
    IUpdateUserUseCase,
    IUpdateVendorReqUseCase
} from "../../../domain/interfaces/model/usecases.interface";
import { TOKENS } from "../../../constants/token";
import { IGetAdminAnalyticsUseCase } from "../../../domain/interfaces/model/booking.interface";
import { IAwsImageUploader } from "../../../domain/interfaces/model/admin.interface";
import { AwsImageUploader } from "../../../application/use-cases/common/imageUploader";


container.register<IBlockUnblockUser>(TOKENS.BlockUserUseCase, {
    useClass: BlockUnblockUser,
})

container.register<IGetAllUsersUseCase>(TOKENS.GetAllUsersUseCase, {
    useClass: GetAllUsers,
})

container.register<IGetAllVendorReqUseCase>(TOKENS.GetAllVendorReqUseCase, {
    useClass: GetAllVendorReq,
})

container.register<IUpdateVendorReqUseCase>(TOKENS.UpdateVendorReqUseCase, {
    useClass: UpdateVendorReq,
})

container.register<IGetAdminAnalyticsUseCase>(TOKENS.GetAdminAnalyticsUseCase, {
    useClass: GetAdminAnalyticsUseCase,
})

container.register<IUpdateUserUseCase>(TOKENS.UpdateUserUseCase, {
    useClass: UpdateUser,
})

container.register<IGetUserUseCase>(TOKENS.GetUserUseCase, {
    useClass: GetUserProfileUseCase,
})

container.register<IUpdateKycUseCase>(TOKENS.UpdateKycUseCase, {
    useClass: UpdateKycUseCase,
})

container.register<IGetVendorUseCase>(TOKENS.GetVendorUseCase, {
    useClass: GetVendorProfileUseCase,
})

container.register<IAwsImageUploader>(TOKENS.AwsImageUploader, {
    useClass: AwsImageUploader,
})