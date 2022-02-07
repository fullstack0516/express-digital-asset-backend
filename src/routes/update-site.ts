import { Request, Response } from 'express';
import Joi = require('joi');
import { mediaLinkSchema } from '../models/media-link';
import { isSiteOwner, updateSite as updateSiteF } from '../utils/helpers-sites';


const scheme = Joi.object({
    siteToUpdateUid: Joi.string().required(),
    name: Joi.string().required().min(2).optional(),
    siteIcon: mediaLinkSchema.optional(),
    description: Joi.string().min(0).max(512).optional(),
})

/**
 * @api {post} api/update-site Update Site
 * @apiDescription updates a site for the user.
 * @apiName updateSite
 * @apiGroup Sites
 * @apiParamExample {json} Request-Example:
 * {
 *     siteToUpdateUid: string
 *     name?: string,
 *     siteIcon?: <MediaLink>,
 *     description?: string
 * }
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      site: <Site>
 * }
 */
export const updateSite = async (req: Request, res: Response) => {
    try {

        await scheme.validateAsync(req.body)
        await isSiteOwner(req.body.siteToUpdateUid, req.user.uid)

        const {
            name,
            siteIcon,
            description,
        } = req.body

        const site = await updateSiteF(req.body.siteToUpdateUid, {
            name,
            description,
            siteIcon,
        })

        return res.json({ site })

    } catch (e) {
        throw e;
    }
}
