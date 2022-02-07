import { Request, Response } from 'express';
import Joi = require('joi');
import { fetchPage, deletePage as deletePageF } from '../utils/helpers-pages';
import { isSiteOwner } from '../utils/helpers-sites';

const scheme = Joi.object({
    pageToDeleteUid: Joi.string().required(),
})

/**
 * @api {post} api/delete-page Deletes a page.
 * @apiDescription delete a page for the user.
 * @apiName deletePage
 * @apiGroup Pages
 * @apiParamExample {json} Request-Example:
 * {
 *     pageToDeleteUid: string,
 * }
 * @apiPermission [authenticated]
 */
export const deletePage = async (req: Request, res: Response) => {
    try {

        await scheme.validateAsync(req.body)

        const {
            pageToDeleteUid
        } = req.body

        const page = await fetchPage(req.body.pageToDeleteUid)
        await isSiteOwner(page.siteUid, req.user.uid)

        await deletePageF(pageToDeleteUid)

        return res.status(200).end()

    } catch (e) {
        throw e;
    }
}
