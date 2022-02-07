import { Request, Response } from 'express';
import Joi = require('joi');
import Page, { pageSchema } from '../models/page';
import { createUid } from '../utils/helpers';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';
import { isSiteOwner } from '../utils/helpers-sites';
import { isPageUrlUnique } from '../utils/helpers-pages'
import { RouteError } from '../utils/route-error';

const scheme = Joi.object({
    title: Joi.string().required().min(2),
    siteUid: Joi.string().required(),
    url: Joi.string().regex(/^[a-z0-9-]+$/).required(),
})

/**
 * @api {post} api/create-page Create Page
 * @apiDescription Creates a page for the user.
 * @apiName createPage
 * @apiGroup Pages
 * @apiParamExample {json} Request-Example:
 * {
 *     title: string,
 *     pageIcon: <MediaLink>,
 *     description: string,
 *     // Lower case and hypthens only.
 *     url: string,
 * }
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 
 * {
 *   statusCode: invalid-fields | page-url-not-unique
 * }
 */
export const createPage = async (req: Request, res: Response) => {
    try {
        await scheme.validateAsync(req.body)

        const {
            title,
            url,
            siteUid,
        } = req.body

        if (req.user.isFlagged) {
            throw new RouteError('user-is-flagged', 'The user has been flagged. They cannot create pages.')
        }

        await isSiteOwner(siteUid, req.user.uid)

        // Check the url is unique
        if (!(await isPageUrlUnique(url))) {
            throw new RouteError('page-url-not-unique', 'The page url was not unique.')
        }

        const page: Page = {
            uid: createUid(),
            contentSections: [],
            contentDraftSections: [],
            dataTags: {},
            contentCategories: [],
            url,
            lastUpdateIso: new Date().toISOString(),
            lastPublishIso: new Date().toISOString(),
            createdIso: new Date().toISOString(),
            totalEarnings: 0,
            totalImpressions: 0,
            totalVisits: 0,
            isBanned: false,
            isDeleted: false,
            isPublished: false,
            isFlagged: false,
            siteUid,
            title,
            description: '',
            numberOfReports: 0,
            pageColor: '#FF7534',
            likes: 0,
            pageOwner: req.user.uid
        }

        await pageSchema.validateAsync(page)
        await mongoDb.collection(collectionNames.pages).insertOne(page)

        return res.json({ page })

    } catch (e) {
        throw e;
    }
}
