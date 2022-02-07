import Joi = require('joi')
import { MediaLink, mediaLinkSchema } from './media-link'

export interface User {
    uid: string,
    username: string,
    /**
     * Email is provided as a backup.
     */
    bio?: string;
    email?: string,
    createdIso: string,
    profileMedia: MediaLink,
    lastOpenedAppIso: string,
    isBanned: boolean,
    isDeleted: boolean,
    isFlagged: boolean;
    isAdmin: boolean,
    phoneNumber: string;
    /**
     * The user who reported this user + why.
     */
    reports: { [userUid: string]: string },
    /**
     * Their total visits across sites.
     */
    totalVisitsOnSites: number;
    /**
     * Their total impressions across sites.
     */
    totalImpressionsOnSites: number;
}

export const userSchema = Joi.object({
    _id: Joi.any(),
    uid: Joi.string(),
    username: Joi.string().min(2).max(17).required(),
    bio: Joi.string().min(0).max(512).optional(),
    email: Joi.string().email().optional(),
    profileMedia: mediaLinkSchema,
    reports: Joi.object().required(),
    lastOpenedAppIso: Joi.string().isoDate().required(),
    createdIso: Joi.string().isoDate().required(),
    isBanned: Joi.boolean().required(),
    isDeleted: Joi.boolean().required(),
    isFlagged: Joi.boolean().required(),
    phoneNumber: Joi.string().min(3).required(),
    totalVisitsOnSites: Joi.number().min(0).required(),
    totalImpressionsOnSites: Joi.number().min(0).required(),
    isAdmin: Joi.boolean().required(),
})
