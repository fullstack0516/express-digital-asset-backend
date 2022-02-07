import { Request, Response } from 'express';
import Joi = require('joi');
import { mediaLinkSchema } from '../models/media-link';
import Site, { siteSchema } from '../models/site';
import { createUid } from '../utils/helpers';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';
import { isSiteUrlUnique } from '../utils/helpers-sites';
import { RouteError } from '../utils/route-error';

const scheme = Joi.object({
    name: Joi.string().required().min(2),
    siteIcon: mediaLinkSchema.required(),
    description: Joi.string().min(0).max(512).optional(),
    url: Joi.string().regex(/^[a-z0-9-]+$/).required(),
    siteColor: Joi.string().regex(/^#[a-z0-9A-Z]+$/).optional(),
})

/**
 * @api {post} api/create-site Create Site
 * @apiDescription Creates a site for the user.
 * @apiName createSite
 * @apiGroup Sites
 * @apiParamExample {json} Request-Example:
 * {
 *     name: string,
 *     siteIcon: <MediaLink>,
 *     description: string,
 *     // Lower case and hypthens only.
 *     url: string,
 *     siteColor: string as hex
 * }
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      site: <Site>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *   statusCode: invalid-fields | site-url-not-unique
 * }
 */
export const createSite = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)

        const {
            name,
            siteIcon,
            description,
            url,
            siteColor
        } = req.body

        if (req.user.isFlagged) {
            throw new RouteError('user-is-flagged', 'The user has been flagged. They cannot create sites.')
        }

        // Check the url is unique
        if (!(await isSiteUrlUnique(url))) {
            throw new RouteError('site-url-not-unique', 'The page url was not unique.')
        }

        const site: Site = {
            uid: createUid(),
            name,
            description: description ?? '',
            siteIcon,
            url,
            siteColor,
            lastSiteUpdatedIso: new Date().toISOString(),
            createdIso: new Date().toISOString(),
            siteOwnersUids: [req.user.uid],
            totalEarnings: 0,
            totalVisits: 0,
            totalImpressions: 0,
            isBanned: false,
            isDeleted: false,
        }

        await siteSchema.validateAsync(site)
        await mongoDb.collection(collectionNames.sites).insertOne(site)

        return res.json({ site })

    } catch (e) {
        throw e;
    }
}
