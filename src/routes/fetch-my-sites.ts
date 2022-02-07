import { Request, Response } from 'express';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';
import Site from '../models/site'
import Joi = require('joi');

const scheme = Joi.object({
    fromIso: Joi.string().isoDate().required(),
})

/**
 * @api {post} api/fetch-my-sites Fetch My Sites
 * @apiDescription Fetches the users sites.
 * @apiName fetchMySites
 * @apiGroup Sites
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     fromIso: string,
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      sites: <Site[]>
 * }
 */
export const fetchMySites = async (req: Request, res: Response) => {

    await scheme.validateAsync(req.body)

    const {
        fromIso,
    } = req.body

    const sites = await fetchUserSites(req.user.uid, fromIso);

    return res.status(200).json({ sites });
};


export const fetchUserSites = async (userUid: string, fromIso: string) => {
    const sites = await mongoDb.collection<Site>(collectionNames.sites).find(
        {
            siteOwnersUids: { $in: [userUid] },
            isDeleted: false,
            lastSiteUpdatedIso: { $lte: fromIso }
        }
    )
        .sort({
            lastSiteUpdatedIso: -1,
        })
        .limit(20)
        .toArray()
    return sites;
}