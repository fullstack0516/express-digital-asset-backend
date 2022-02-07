import * as Joi from "joi";

/**
 * The users reports to the page
 */
export interface PageLike {
    uid: string;
    userUid: string;
    pageUid: string;
    createdIso: string;
    liked: -1 | 0 | 1;
}

export const subscriptionSchema = Joi.object({
    uid: Joi.string().required(),
    userUid: Joi.string().required(),
    pageUid: Joi.string().required(),
    liked: Joi.number().integer().min(-1).max(1).required(),
    createdIso: Joi.string().isoDate().required(),
})
