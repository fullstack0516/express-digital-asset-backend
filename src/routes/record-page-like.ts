import { Request, Response } from 'express';
import Joi = require('joi');
import { fetchPage, likePage } from '../utils/helpers-pages';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
    liked: Joi.number().integer().min(-1).max(1).required(),
})

/**
 * @api {post} api/record-page-like Record like to page
 * @apiDescription Record the page like
 * @apiName likePage
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string
 *     liked: -1 | 0 | 1
 * }
 * @apiPermission [authenticated]
 * {
 *      page: <Page>
 * }
 */
export const recordPageLike = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body);

        await likePage(req.body.pageUid, req.user.uid, req.body.liked)

        return res.json({
            page: (await fetchPage(req.body.pageUid))
        })
    } catch (e) {
        throw e;
    }
}