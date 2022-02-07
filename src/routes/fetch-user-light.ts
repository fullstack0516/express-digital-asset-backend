import { Request, Response } from 'express';
import { fetchUser, createUserLight } from '../utils/helpers-users';
import * as Joi from 'joi';

const scheme = Joi.object({
    userLightUid: Joi.string().min(2).max(32),
})
/**
 * @api {post} api/fetch-user-light Fetch User Light
 * @apiDescription Fetches user light, user light is public version of the user with no sensative fields exposed.
 * @apiName fetchUserLight
 * @apiGroup User
 * @apiParamExample {json} Request-Example:
 * {
 *     userLightUid: string
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      userLight: <UserLight>
 * }
 **/
export const fetchUserLight = async (req: Request, res: Response) => {
    await scheme.validateAsync(req.body)
    const { userLightUid } = req.body;
    const user = await fetchUser(userLightUid)
    const userLight = createUserLight(user);
    return res.status(200).json({ userLight });
};
