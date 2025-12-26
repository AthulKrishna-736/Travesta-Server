import { container } from "tsyringe"
import { TOKENS } from "../../../constants/token"

import { CreatePlanUseCase } from "../../../application/use-cases/subscription/createPlanUseCase";
import { UpdatePlanUseCase } from "../../../application/use-cases/subscription/updatePlanUseCase";
import { GetActivePlansUseCase } from "../../../application/use-cases/subscription/getActivePlansUseCase";
import { GetAllPlansUseCase } from "../../../application/use-cases/subscription/getAllPlansUseCase";
import { BlockUnblockPlanUseCase } from "../../../application/use-cases/subscription/blockUnblockPlanUseCase";
import { GetAllPlanHistoryUseCase } from "../../../application/use-cases/subscription/getAllPlansHistoryUseCase";
import { GetUserActivePlanUseCase } from "../../../application/use-cases/subscription/getUserActivePlanUseCase";
import { CancelSubscriptionUseCase } from "../../../application/use-cases/user/cancelSubscription";

import {
    IBlockUnblockPlanUseCase,
    ICancelSubscriptionUseCase,
    ICreatePlanUseCase,
    IGetActivePlansUseCase,
    IGetAllPlanHistoryUseCase,
    IGetAllPlansUseCase,
    IGetUserActivePlanUseCase,
    ISubscribePlanUseCase,
    IUpdatePlanUseCase
} from "../../../domain/interfaces/model/subscription.interface";
import { SubscribePlanUseCase } from "../../../application/use-cases/user/subscribePlan.UseCase";


container.register<ICreatePlanUseCase>(TOKENS.CreateSubscriptionUseCase, {
    useClass: CreatePlanUseCase,
})

container.register<IUpdatePlanUseCase>(TOKENS.UpdateSubscriptionUseCase, {
    useClass: UpdatePlanUseCase,
})

container.register<IGetActivePlansUseCase>(TOKENS.GetActiveSubscriptionsUseCase, {
    useClass: GetActivePlansUseCase,
})

container.register<IGetAllPlansUseCase>(TOKENS.GetAllSubscriptionsUseCase, {
    useClass: GetAllPlansUseCase,
})

container.register<IBlockUnblockPlanUseCase>(TOKENS.BlockUnblockSubscriptionUseCase, {
    useClass: BlockUnblockPlanUseCase,
})

container.register<IGetUserActivePlanUseCase>(TOKENS.GetUserActivePlanUseCase, {
    useClass: GetUserActivePlanUseCase,
})

container.register<ICancelSubscriptionUseCase>(TOKENS.CancelSubscriptionUseCase, {
    useClass: CancelSubscriptionUseCase,
})

container.register<ISubscribePlanUseCase>(TOKENS.SubscribePlanUseCase, {
    useClass: SubscribePlanUseCase,
})

container.register<IGetAllPlanHistoryUseCase>(TOKENS.GetAllPlanHistoryUseCase, {
    useClass: GetAllPlanHistoryUseCase,
})