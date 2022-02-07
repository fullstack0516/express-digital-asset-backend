import * as Joi from 'joi';
import ContentSection, { contentSectionSchema, ContentTypes } from './content-section'
import { DataTag, dataTagSchema } from './data-tag';

export default interface Page {
    uid: string;
    title: string;
    /**
     * Used for the meta data.
     * In search for example.
     */
    description: string;
    /**
     * The site that owns this page.
     */
    siteUid: string;
    /*
    The url the user wants for the page under our domain.
    The url is alpha-numeric with hypthens only '-'
    */
    url: string;
    totalImpressions: number;
    totalVisits: number;
    /**
     * The total ad earnings in USD.
     */
    totalEarnings: number;
    /**
     * When a page was last updated.
     */
    lastUpdateIso: string;
    /**
     * When a page was last published.
     */
    lastPublishIso: string;
    /**
     * When the page was created.
     */
    createdIso: string;
    /**
     * The page data-tags we create automatically.
     */
    dataTags: { [tagString: string]: DataTag },
    /**
     * This is generated automatically via the ML.
     */
    contentCategories: string[],
    /**
     * The content sections in order.
     */
    contentSections: ContentSection<ContentTypes>[],
    /**
     * When the user publishes the draft section overwrites the contentSections.
     */
    contentDraftSections: ContentSection<ContentTypes>[],
    isDeleted: boolean;
    isBanned: boolean;
    isPublished: boolean;
    /**
     * If the page has been flagged.
     */
    isFlagged: boolean;
    numberOfReports: number;
    pageColor: string;
    likes: number;
    /**
     * author
     */
    pageOwner: string
}

export const pageSchema = Joi.object({
    _id: Joi.any(),
    uid: Joi.string().required(),
    title: Joi.string().required().max(70).min(2),
    description: Joi.string().allow(''),
    siteUid: Joi.string(),
    url: Joi.string().regex(/^[a-z0-9-]+$/).required(),
    totalImpressions: Joi.number().min(0).required(),
    totalVisits: Joi.number().min(0).required(),
    totalEarnings: Joi.number().min(0).required(),
    lastUpdateIso: Joi.string().isoDate().required(),
    lastPublishIso: Joi.string().isoDate().required(),
    createdIso: Joi.string().isoDate().required(),
    dataTags: Joi.object().keys({ tagString: dataTagSchema }).unknown(true),
    contentCategories: Joi.array().items(Joi.string()).required(),
    contentSections: Joi.array().items(contentSectionSchema),
    contentDraftSections: Joi.array().items(contentSectionSchema),
    isDeleted: Joi.boolean().required(),
    isBanned: Joi.boolean().required(),
    isPublished: Joi.boolean().required(),
    isFlagged: Joi.boolean().required(),
    numberOfReports: Joi.number().min(0).required(),
    pageColor: Joi.string().regex(/^#[a-z0-9A-Z]+$/).required(),
    likes: Joi.number().required(),
    pageOwner: Joi.string().required()
})
