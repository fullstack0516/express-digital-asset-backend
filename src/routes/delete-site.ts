import { Request, Response } from 'express';
import Joi = require('joi');
import { isSiteOwner } from '../utils/helpers-sites';
import { deleteSite as deleteSiteF } from '../utils/helpers-sites'

const scheme = Joi.object({
    siteToDeleteUid: Joi.string().required(),
})

/**
 * @api {post} api/delete-site Deletes a site and all the pages
 * @apiDescription delete a site for the user.
 * @apiName deleteSite
 * @apiGroup Sites
 * @apiParamExample {json} Request-Example:
 * {
 *     siteToDeleteUid: string,
 * }
 * @apiPermission [authenticated]
 */
export const deleteSite = async (req: Request, res: Response) => {
    try {

        await scheme.validateAsync(req.body)
        await isSiteOwner(req.body.siteToDeleteUid, req.user.uid)

        const {
            siteToDeleteUid
        } = req.body

        await deleteSiteF(siteToDeleteUid)

        return res.status(200).end()

    } catch (e) {
        throw e;
    }
}
