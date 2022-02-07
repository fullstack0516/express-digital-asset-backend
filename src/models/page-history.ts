import * as Joi from "joi";

export interface PageHistory {
    uid: string;
    userUid: string;
    pageUid: string;
    siteUid: string;
    pageUrl: string;
    siteUrl: string;
    createdIso: string;
    lastUpdateIso: string;
    numberOfVisits: number;
    /**
     * We record when the page was last published.
     * If this is different then we should record data tags again.
     */
    lastPagePublishIso: string
}

export const pageHistorySchema = Joi.object({
    uid: Joi.string().required(),
    userUid: Joi.string().required(),
    pageUid: Joi.string().required(),
    siteUid: Joi.string().required(),
    createdIso: Joi.string().isoDate().required(),
    lastUpdateIso: Joi.string().isoDate().required(),
    pageUrl: Joi.string().required(),
    siteUrl: Joi.string().required(),
    numberOfVisits: Joi.number().required(),
    lastPagePublishIso: Joi.string().isoDate().required(),
})
