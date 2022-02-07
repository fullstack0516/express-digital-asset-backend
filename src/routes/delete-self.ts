import { Request, Response } from 'express';
import { createUid } from '../utils/helpers'
import { randomDummyProfilePhoto } from '../utils/helpers-photos'
import { fetchUser, updateUser } from '../utils/helpers-users';
import { deleteFileViaUrl } from '../utils/helper-storage';
import { deleteUserSites } from '../utils/helpers-sites';

/**
 * @api {post} api/delete-self Delete Self
 * @apiDescription Delete the users personal data.
 * @apiName deleteSelf
 * @apiGroup User
 */
export const deleteSelf = async (req: Request, res: Response) => {
    try {

        const user = req.user;

        await deleteFileViaUrl(user.profileMedia.url)

        await updateUser(user.uid, {
            username: ('deleted-' + createUid()).substr(0, 16),
            phoneNumber: '+999' + createUid(),
            profileMedia: randomDummyProfilePhoto(),
        })

        await deleteUserSites(req.user.uid);

        const updatedUser = await fetchUser(req.user.uid);

        return res.json({ user: updatedUser })

    } catch (e) {
        throw e;
    }
};
