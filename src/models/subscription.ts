import * as Joi from "joi";

/**
 * The users subscription to the site
 */
export interface Subscription {
    uid: string;
    userUid: string;
    siteUid: string;
    subscriptionIso: string;
}

export const subscriptionSchema = Joi.object({
    uid: Joi.string().required(),
    userUid: Joi.string().required(),
    siteUid: Joi.string().required(),
    subscriptionIso: Joi.string().isoDate().required(),
})
