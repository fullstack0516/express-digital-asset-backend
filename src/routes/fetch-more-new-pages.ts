import { fetchNewPages } from '../utils/helpers-pages';
import { Request, Response } from 'express';
import * as Joi from 'joi';

const scheme = Joi.object({
    siteUid: Joi.string().required(),
    fromIso: Joi.string().isoDate().optional(),
})

/**
 * @api {post} api/fetch-more-new-pages 
 * @apiDescription Fetch more new pages via siteUid
 * @apiName fetchMoreNewPages
 * @apiGroup PublicPages
 * @apiParamExample {json} Request-Example:
 * {
 *     siteUid: string,
 *     fromIso: string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      newPagesFromSite: <Page[]>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *      statusCode: invalid-fields | no-page
 * }
 */
export const fetchMoreNewPages = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)

    return res.json({
        newPagesFromSite: (await fetchNewPages(req.body.siteUid, req.body.fromIso)),
    })
};
