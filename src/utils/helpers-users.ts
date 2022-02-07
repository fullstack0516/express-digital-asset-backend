import { addDummyIfNoPhotos } from './helpers-photos';
import { userSchema } from './../models/user';
import { UserLight } from '../models/user-light';
import { User } from '../models/user';
import { RouteError } from './route-error';
import { collectionNames, mongoDb } from './helpers-mongo';
import { deleteUndefinedKeys } from './helpers';

export const createUserLight = (user: User) => {
    const userLight: UserLight = {
        uid: user.uid,
        username: user.username,
        profileMedia: user.profileMedia,
    };
    return userLight;
}

/**
 * Returns undefined if there's no user.
 */
export const fetchUser = async (uid: string): Promise<User> => {
    let user = await mongoDb.collection<User | null>(collectionNames.users).findOne({ uid })
    if (!user) {
        throw new RouteError('no-user', 'No user exists.')
    }
    // @ts-ignore
    delete user._id
    return user;
}


export const updateUser = async (uid: string, data: any): Promise<User> => {

    deleteUndefinedKeys(data)

    const user = await fetchUser(uid)
    const updateUserData: User = {
        ...user,
        ...data,
        ...{ uid },
    }

    // @ts-ignore
    delete updateUserData._id

    await userSchema.validateAsync(updateUserData);
    await mongoDb.collection<User>(collectionNames.users).updateOne(
        { uid },
        {
            $set: updateUserData,
        },
    )

    return updateUserData;
}

