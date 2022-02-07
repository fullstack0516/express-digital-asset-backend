import Joi = require('joi')
import { MediaLink, mediaLinkSchema } from '../models/media-link'

export default interface Site {
    uid: string;
    name: string;
    siteIcon: MediaLink;
    /**
     * What is the site about;
     */
    description: string;
    /*
    The url the user wants for the site under our domain.
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
     * When a site was last updated.
     */
    lastSiteUpdatedIso: string;
    /**
     * The users who control the site an it's pages.
     */
    createdIso: string;
    isDeleted: boolean;
    isBanned: boolean;
    siteOwnersUids: string[];
    siteColor: string;
}

export const siteSchema = Joi.object({
    _id: Joi.any(),
    uid: Joi.string().required(),
    name: Joi.string().required().min(2),
    siteIcon: mediaLinkSchema.required(),
    description: Joi.string().allow('').max(512).optional(),
    url: Joi.string().regex(/^[a-z0-9-]+$/).required(),
    siteColor: Joi.string().regex(/^#[a-z0-9A-Z]+$/).optional(),
    totalImpressions: Joi.number().min(0).required(),
    totalVisits: Joi.number().min(0).required(),
    totalEarnings: Joi.number().min(0).required(),
    lastSiteUpdatedIso: Joi.string().isoDate().required(),
    createdIso: Joi.string().isoDate().required(),
    siteOwnersUids: Joi.array().items(Joi.string()),
    isDeleted: Joi.boolean().required(),
    isBanned: Joi.boolean().required(),
})
