import { PageHistory } from './../models/page-history';
import { Request, Response } from 'express';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';

export const setupIndexes = async (req: Request, res: Response) => {

    // User indexes
    await mongoDb.collection(collectionNames.users).dropIndexes()
    await mongoDb.collection(collectionNames.users).createIndex({ uid: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.users).createIndex({ username: 1 }, { unique: false })

    // Site indexes
    await mongoDb.collection(collectionNames.sites).dropIndexes()
    await mongoDb.collection(collectionNames.sites).createIndex({ uid: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.sites).createIndex({ url: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.sites).createIndex({ createdIso: 1 })
    await mongoDb.collection(collectionNames.sites).createIndex({ lastSiteUpdatedIso: 1 })
    await mongoDb.collection(collectionNames.sites).createIndex({ siteOwnersUids: 1, lastSiteUpdatedIso: 1 })
    await mongoDb.collection(collectionNames.sites).createIndex({ siteOwnersUids: 1, isDeleted: 1, lastSiteUpdatedIso: -1, })
    await mongoDb.collection(collectionNames.sites).createIndex({ totalVisits: -1, })

    // Page indexes
    await mongoDb.collection(collectionNames.pages).dropIndexes()
    await mongoDb.collection(collectionNames.pages).createIndex({ uid: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.pages).createIndex({ url: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.pages).createIndex({ url: 1, siteUid: 1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ siteUid: 1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ siteUid: 1, totalVisits: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ siteUid: 1, totalVisits: -1, createdIso: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ siteUid: 1, createdIso: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, lastUpdateIso: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ totalVisits: -1, })
    await mongoDb.collection(collectionNames.pages).createIndex({ createdIso: -1, })
    await mongoDb.collection(collectionNames.pages).createIndex({ createdIso: -1, totalVisits: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ contentCategories: 1, totalVisits: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ siteUid: -1, createdIso: -1, isDeleted: 1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, contentCategories: 1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, contentCategories: 1, createdIso: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, createdIso: -1, contentCategories: 1, totalVisits: -1 })
    await mongoDb.collection(collectionNames.pages).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, lastUpdateIso: -1, contentCategories: 1 })

    // Subscription indexes
    await mongoDb.collection(collectionNames.subscriptions).dropIndexes()
    await mongoDb.collection(collectionNames.subscriptions).createIndex({ uid: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.subscriptions).createIndex({ userUid: 1, siteName: 1 })
    await mongoDb.collection(collectionNames.subscriptions).createIndex({ userUid: 1, uid: 1 })
    await mongoDb.collection(collectionNames.subscriptions).createIndex({ userUid: 1 })

    // Report indexes
    await mongoDb.collection(collectionNames.reports).dropIndexes()
    await mongoDb.collection(collectionNames.reports).createIndex({ uid: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.reports).createIndex({ pageUid: 1, userUid: 1 })

    // Page History indexes
    await mongoDb.collection(collectionNames.pageHistory).dropIndexes()
    await mongoDb.collection(collectionNames.pageHistory).createIndex({ uid: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.pageHistory).createIndex({ pageUid: 1, userUid: 1 })
    await mongoDb.collection(collectionNames.pageHistory).createIndex({ userUid: 1 })
    await mongoDb.collection(collectionNames.pageHistory).createIndex({ userUid: 1, lastUpdateIso: -1 })

    // User data tag indexes
    await mongoDb.collection(collectionNames.userDataTags).dropIndexes()
    await mongoDb.collection(collectionNames.userDataTags).createIndex({ uid: 1 }, { unique: true })
    await mongoDb.collection(collectionNames.userDataTags).createIndex({ userUid: 1 })
    await mongoDb.collection(collectionNames.userDataTags).createIndex({ userUid: 1, tagRecordedForUserIso: -1 })
    await mongoDb.collection(collectionNames.userDataTags).createIndex({ userUid: 1, contentCategories: 1 })
    await mongoDb.collection(collectionNames.userDataTags).createIndex({ userUid: 1, contentCategories: -1 })

    // Blacklist
    await mongoDb.collection(collectionNames.blacklistedUserCategories).dropIndexes()
    await mongoDb.collection(collectionNames.blacklistedUserCategories).createIndex({ userUid: 1 })
    await mongoDb.collection(collectionNames.blacklistedUserCategories).createIndex({ userUid: 1, categoryName: 1 })

    return res.json({ status: 'done' }).end()
}
