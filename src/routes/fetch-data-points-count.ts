import { Request, Response } from 'express';
import { countOfDataPoints } from '../utils/helpers-data-tags';

/**
 * @api {post} api/fetch-data-points-count 
 * @apiDescription Fetches count of the users data points
 * @apiName fetchDataPointsCount
 * @apiGroup User
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      user: <User>
 * }
 */
export const fetchDataPointsCount = async (req: Request, res: Response) => {
    try {
        const count = await countOfDataPoints(
            req.user.uid
        )

        return res.json({ count })

    } catch (e) {
        throw e;
    }
};
