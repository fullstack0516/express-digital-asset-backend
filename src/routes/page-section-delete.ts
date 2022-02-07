import { Request, Response } from 'express';
import * as Joi from 'joi';
import { deleteContentSection, fetchPage, updatePage } from '../utils/helpers-pages';
import { isSiteOwner } from '../utils/helpers-sites';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
    contentSectionUid: Joi.string().required(),
})

/**
 * @api {post} api/page-content-section-delete Deletes a content block from the drafts.
 * @apiDescription Page Add Content Delete
 * @apiName pageContentSectionDelete
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string,
 *     contentSectionUid: string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>
 * }
 */
export const pageSectionDelete = async (req: Request, res: Response) => {

    try {
        await scheme.validateAsync(req.body)

        const page = await fetchPage(req.body.pageUid)
        await isSiteOwner(page.siteUid, req.user.uid)

        await deleteContentSection(req.body.pageUid, req.body.contentSectionUid, false)

        return res.json({
            page: (await fetchPage(page.uid)),
        })

    } catch (e) {
        throw e;
    }
};
