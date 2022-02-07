import { Request, Response } from 'express';
import { updatePage } from '../utils/helpers-pages';
import * as Joi from 'joi';
import { fetchPage } from '../utils/helpers-pages';
import { isSiteOwner } from '../utils/helpers-sites';
import { RouteError } from '../utils/route-error';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
    fromIndex: Joi.number().integer().min(0).required(),
    toIndex: Joi.number().integer().min(0).required(),
})

/**
 * @api {post} api/page-sections-reorder reorder the content sections
 * @apiDescription Page Reorder Content
 * @apiName pageSectionsReorder
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string,
 *     fromIndex: number,
 *     toIndex: number
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>,
 * }
 */

export const pageSectionsReorder = async (req: Request, res: Response) => {

    try {
        await scheme.validateAsync(req.body);
        const { pageUid, fromIndex, toIndex } = req.body;

        const page = await fetchPage(pageUid);
        await isSiteOwner(page.siteUid, req.user.uid);

        let contentDraftSections = page.contentDraftSections;

        // in the reordered result, first section should be header
        if (
            (toIndex === 0 && contentDraftSections[fromIndex].type !== 'header') ||
            (fromIndex === 0 && contentDraftSections[toIndex].type !== 'header')
        ) {
            throw new RouteError('first-not-header', 'First Section should be header content.');
        }

        // change the order of the sections
        const item = contentDraftSections.splice(fromIndex, 1)[0];
        contentDraftSections.splice(toIndex, 0, item);

        await updatePage(page.uid, { contentDraftSections });

        return res.json({
            page: (await fetchPage(pageUid))
        })

    } catch (e) {
        throw e;
    }
};
