import { Request, Response } from 'express';
import { countOfUsers } from '../utils/helpers-admin';

/**
 * @api {post} api/admin-fetch-users-count 
 * @apiDescription Fetches count of the users
 * @apiName adminFetchUsersCount
 * @apiGroup admin
 * @apiPermission [authenticated]
 * @apiSuccessExample {json} Success-Response:
 * {
 *      count: number
 * }
 */
export const adminFetchUsersCount = async (req: Request, res: Response) => {
    try {
        const count = await countOfUsers();

        return res.json({ count })

    } catch (e) {
        throw e;
    }
};
