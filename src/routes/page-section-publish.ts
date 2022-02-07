import { RouteError } from './../utils/route-error';
import { Request, Response } from 'express';
import * as Joi from 'joi';
import { fetchPage, publishPage } from '../utils/helpers-pages';
import { isSiteOwner } from '../utils/helpers-sites';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
})

/**
 * @api {post} api/page-section-publish Publish a page
 * @apiDescription Publish the page and process the data tags.
 * @apiName pageSectionPublish
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>,
 * }
 */
export const pageSectionPublish = async (req: Request, res: Response) => {

    try {
        await scheme.validateAsync(req.body)

        if (req.user.isFlagged) {
            throw new RouteError('user-is-flagged', 'The user has been flagged. They cannot publish content.')
        }

        const page = await fetchPage(req.body.pageUid)
        await isSiteOwner(page.siteUid, req.user.uid)

        const { pageUid } = req.body;

        await publishPage(pageUid)

        return res.json({
            page: await fetchPage(pageUid)
        })

    } catch (e) {
        throw e;
    }
};
