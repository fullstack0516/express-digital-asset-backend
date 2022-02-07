import { Request, Response } from 'express';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';
import { WebsiteStatus, websiteStatusSchema } from '../models/website-status';

/**
 * @api {post} api/fetch-website-status
 * @apiDescription Fetches website Status
 * @apiName fetchWebsiteStatus
 * @apiGroup User
 * @apiSuccessExample {json} Success-Response:
 * {
 *      websiteStatus: <WebsiteStatus>
 * }
 */
export const fetchWebsiteStatus = async (req: Request, res: Response) => {
    const websiteStatus = await mongoDb.collection<WebsiteStatus>(collectionNames.websiteStatus).findOne({ uid: 'initialisation' })
    if (!websiteStatus) {
        // create the maintenance document
        const maintenance = {
            uid: 'initialisation',
            mode: 'online',
            isUnderMaintenance: false,
            maintenanceMessageForUsers: 'The website is under maintenance. Please try again in 5 minutes.'
        }

        await websiteStatusSchema.validateAsync(maintenance);
        await mongoDb.collection(collectionNames.websiteStatus).insertOne(maintenance);
        return res.status(200).json({ websiteStatus: maintenance });
    }
    return res.status(200).json({ websiteStatus });
};