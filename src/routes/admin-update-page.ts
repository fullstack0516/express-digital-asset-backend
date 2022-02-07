import { Request, Response } from 'express';
import Joi = require('joi');
import { updatePage as updatePageF } from '../utils/helpers-admin';

const scheme = Joi.object({
    pageToUpdateUid: Joi.string().required(),
    isBanned: Joi.boolean().optional(),
})

/**
 * @api {post} api/admin-update-page Update Page as admin role
 * @apiDescription updates a page.
 * @apiName adminUpdatePage
 * @apiGroup Pages
 * @apiParamExample {json} Request-Example:
 * {
 *     pageToUpdateUid: string
 *     isBanned?: boolean
 * }
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>
 * }
 */
export const adminUpdatePage = async (req: Request, res: Response) => {
    try {

        await scheme.validateAsync(req.body)

        const { isBanned } = req.body

        const page = await updatePageF(req.body.pageToUpdateUid, {
            isBanned
        })

        return res.json({ page })

    } catch (e) {
        throw e;
    }
}
