import { Request, Response } from 'express';
import Joi = require('joi');
import { fetchPage, updatePage as updatePageF } from '../utils/helpers-pages';
import { isSiteOwner } from '../utils/helpers-sites';

const scheme = Joi.object({
    pageToUpdateUid: Joi.string().required(),
    title: Joi.string().required().min(2).max(256).optional(),
    pageColor: Joi.string().regex(/^#[a-z0-9A-Z]+$/).optional(),
    isPublished: Joi.boolean().optional(),
})

/**
 * @api {post} api/update-page Update Page
 * @apiDescription updates a page for the user.
 * @apiName updatePage
 * @apiGroup Pages
 * @apiParamExample {json} Request-Example:
 * {
 *     pageToUpdateUid: string
 *     title?: string,
 *     pageColor?: string,
 *     isPublished?: boolean
 * }
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>
 * }
 */
export const updatePage = async (req: Request, res: Response) => {
    try {

        await scheme.validateAsync(req.body)

        const pageToUpdate = await fetchPage(req.body.pageToUpdateUid)

        await isSiteOwner(pageToUpdate.siteUid, req.user.uid)

        const { title, pageColor, isPublished } = req.body

        const page = await updatePageF(req.body.pageToUpdateUid, {
            title,
            pageColor,
            isPublished
        })

        return res.json({ page })

    } catch (e) {
        throw e;
    }
}
