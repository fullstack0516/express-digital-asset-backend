import { Request, Response } from 'express';
import { updateContent } from '../utils/helpers-pages';
import * as Joi from 'joi';
import { fetchPage } from '../utils/helpers-pages';
import { isSiteOwner } from '../utils/helpers-sites';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
    contentSectionUid: Joi.string().required(),
    newImageUrl: Joi.string().uri().optional(),
    newText: Joi.string().max(3000).optional(),
    newVideoUrl: Joi.string().uri().optional(),
    deleteImage: Joi.bool().optional().default(false),
    deleteVideoUrl: Joi.optional().default(false),
    nthImage: Joi.number().integer().min(0).optional(),
})

/**
 * @api {post} api/page-section-update Update content section
 * @apiDescription Page Add Content Update
 * @apiName pageContentSectionUpdate
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string,
 *     contentSectionUid: string
 *     newImageUrl?: string
 *     newText?: string; (markdown only)
 *     newVideoUrl?: string
 *     deleteImage?: boolean
 *     deleteVideoUrl: boolean
 *     nthImage?: 0 | 1 | 2
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>,
 *      updatedSection: <ContentSection>,
 * }
 */

export const pageSectionUpdate = async (req: Request, res: Response) => {

    try {
        await scheme.validateAsync(req.body)

        const page = await fetchPage(req.body.pageUid)
        await isSiteOwner(page.siteUid, req.user.uid)

        const { pageUid, contentSectionUid, newImageUrl, newText, newVideoUrl, deleteImage, deleteVideoUrl, nthImage } = req.body;

        const updatedSection = await updateContent({
            pageUid,
            contentSectionUid,
            newImageUrl,
            newText,
            newVideoUrl,
            deleteImage,
            deleteVideoUrl,
            nthImage
        })

        return res.json({
            page: (await fetchPage(pageUid)),
            updatedSection,
        })

    } catch (e) {
        throw e;
    }
};
