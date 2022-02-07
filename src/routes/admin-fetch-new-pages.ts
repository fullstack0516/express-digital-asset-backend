import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchNewPages } from '../utils/helpers-admin';

const scheme = Joi.object({
    pageNum: Joi.number().integer().min(1).required(),
    showCount: Joi.number().integer().min(1).required()
})

/**
 * @api {post} api/admin-fetch-new-pages
 * @apiDescription Fetches the sites
 * @apiName adminFetchNewPages
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number,
 *      pages: Page[]
 * }
 */
export const adminFetchNewPages = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)
        const { totalCount, pages } = await fetchNewPages(req.body.pageNum, req.body.showCount);

        return res.json({ totalCount, pages })

    } catch (e) {
        throw e;
    }
};
