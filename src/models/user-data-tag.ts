import * as Joi from "joi";

/**
 * The users datatag that was recorded.
 */
export interface UserDataTag {
    uid: string;
    tagString: string;
    tagCreatedIso: string;
    tagScore: number;
    contentCategories: string[];
    count: number;
    userUid: string;
    tagRecordedForUserIso: string;
    companyId: string;
}

export const userDataTagSchema = Joi.object({
    _id: Joi.any(),
    uid: Joi.string().required(),
    tagString: Joi.string().min(1).required(),
    tagCreatedIso: Joi.string().isoDate().required(),
    tagScore: Joi.number().required(),
    contentCategories: Joi.array().items(Joi.string().required()),
    count: Joi.number().required(),
    userUid: Joi.string().required(),
    tagRecordedForUserIso: Joi.string().isoDate().required(),
    companyId: Joi.string().required(),
})
