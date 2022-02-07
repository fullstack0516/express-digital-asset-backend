import * as Joi from "joi";

export interface BlacklistedDataCategory {
    userUid: string;
    category: string;
}

export const blacklistedDataCategorySchema = Joi.object({
    userUid: Joi.string().required(),
    category: Joi.string().required(),
})
