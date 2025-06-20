import { subscriptionModel, TSubscriptionDocument } from "../models/subscriptionModel";
import { BaseRepository } from "./baseRepo";


export class SusbcriptionRepository extends BaseRepository<TSubscriptionDocument> {
    constructor() {
        super(subscriptionModel)
    }

    
}