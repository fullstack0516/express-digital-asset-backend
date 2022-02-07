import { Request, Response } from 'express';
import Page from '../models/page';
import Site from '../models/site';
import { User } from '../models/user';
import { asyncForEach } from '../utils/helpers';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';

export const updateSchema = async (req: Request, res: Response) => {
    // initiative the isPublished value as false
    await mongoDb.collection(collectionNames.pages).updateMany({ isPublished: undefined }, { $set: { isPublished: true } })

    const pages = await mongoDb.collection(collectionNames.pages).find({ pageOwner: undefined }).toArray() as Page[]

    for (const page of pages) {
        const site = await mongoDb.collection(collectionNames.sites).findOne({ uid: page.siteUid }) as Site
        if (site) {
            const user = await mongoDb.collection(collectionNames.users).findOne({ uid: { $in: site.siteOwnersUids } }) as User
            if (user) {
                await mongoDb.collection(collectionNames.pages).updateOne({ uid: page.uid }, { $set: { pageOwner: user.uid } })
            }
        }
    }

    return res.json({ success: true });
}
