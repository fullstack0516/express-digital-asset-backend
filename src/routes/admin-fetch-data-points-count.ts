import { Request, Response } from 'express';
import { countOfDataPoints } from '../utils/helpers-admin';

/**
 * @api {post} api/admin-fetch-data-points-count
 * @apiDescription Fetches count of the data points
 * @apiName adminFetchDataPointsCount
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number
 * }
 */
export const adminFetchDataPointsCount = async (req: Request, res: Response) => {
    try {
        const count = await countOfDataPoints();

        return res.json({ count })

    } catch (e) {
        throw e;
    }
};
