import Page, { pageSchema } from "../models/page"
import Site from "../models/site"
import { User } from "../models/user"
import { UserDataTag } from "../models/user-data-tag"
import { deleteUndefinedKeys } from "./helpers"
import { collectionNames, mongoDb } from "./helpers-mongo"
import { fetchPage } from "./helpers-pages"

export const fetchFlaggedPages = async (fromIso: string) => {
    const flaggedPages = await mongoDb.collection<Page>(collectionNames.pages).find({
        isFlagged: true,
        isBanned: false,
        lastUpdateIso: { $lte: fromIso }
    })
        .sort({
            lastUpdateIso: -1,
        })
        .limit(20)
        .toArray()

    return flaggedPages
}

export const countOfUsers = async (): Promise<number> => {
    return await mongoDb.collection<User>(collectionNames.users).countDocuments();
}

export const countOfNewUsers = async (daysNAgo: number): Promise<{ rate: number, count: number }> => {
    const thisSprintUsersCount = await mongoDb.collection<User>(collectionNames.users).find({
        createdIso: { $gte: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString() },
    }).count();

    let lastSprintUsersCount = await mongoDb.collection<User>(collectionNames.users).find({
        createdIso: {
            $gte: new Date(Date.now() - 2 * daysNAgo * 24 * 60 * 60 * 1000).toISOString(),
            $lt: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString()
        },
    }).count();

    lastSprintUsersCount = lastSprintUsersCount || 1;

    return {
        rate: thisSprintUsersCount / lastSprintUsersCount,
        count: thisSprintUsersCount
    }
}

export const countOfNewSites = async (daysNAgo: number): Promise<{ rate: number, count: number }> => {
    const thisSprintSitesCount = await mongoDb.collection<Site>(collectionNames.sites).find({
        createdIso: { $gte: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString(), },
    }).count();

    let lastSprintSitesCount = await mongoDb.collection<Site>(collectionNames.sites).find({
        createdIso: {
            $gte: new Date(Date.now() - 2 * daysNAgo * 24 * 60 * 60 * 1000).toISOString(),
            $lt: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString()
        },
    }).count();

    lastSprintSitesCount = lastSprintSitesCount || 1;

    return {
        rate: thisSprintSitesCount / lastSprintSitesCount,
        count: thisSprintSitesCount
    }
}

export const countOfDataPoints = async (): Promise<number> => {
    return await mongoDb.collection<UserDataTag>(collectionNames.userDataTags).countDocuments();
}

export const fetchNewUsers = async (fromIso?: string) => {
    let query: any = {
        isDeleted: false,
        isBanned: false
    }

    if (fromIso) {
        query.createdIso = { $lte: fromIso }
    }

    const newUsers = await mongoDb.collection<User>(collectionNames.users).find(query)
        .sort({
            createdIso: -1,
        })
        .limit(8)
        .toArray()
    return newUsers;
}

export const fetchUsers = async (pageNum: number, showCount: number): Promise<{ totalCount: number, users: User[] }> => {
    let query: any = {
        isDeleted: false,
    }
    const totalCount = await mongoDb.collection<User>(collectionNames.users).find(query).count()
    const users = await mongoDb.collection<User>(collectionNames.users).find(query)
        .sort({ createdIso: -1 })
        .skip(showCount * (pageNum - 1))
        .limit(showCount)
        .toArray();

    return { totalCount, users };
}

export const fetchSites = async (pageNum: number, showCount: number): Promise<{ totalCount: number, sites: Site[] }> => {
    let query: any = {
        isDeleted: false,
    }
    const totalCount = await mongoDb.collection<Site>(collectionNames.sites).find(query).count()
    const sites = await mongoDb.collection<Site>(collectionNames.sites).find(query)
        .sort({ createdIso: -1 })
        .skip(showCount * (pageNum - 1))
        .limit(showCount)
        .toArray();

    return { totalCount, sites };
}

export const fetchNewPages = async (pageNum: number, showCount: number): Promise<{ totalCount: number, pages: Page[] }> => {
    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    let query: any = {
        isDeleted: false,
        createdIso: { $gte: daysNAgo.toISOString() },
    }
    const totalCount = await mongoDb.collection<Page>(collectionNames.pages).find(query).count()
    const pages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({ createdIso: -1 })
        .skip(showCount * (pageNum - 1))
        .limit(showCount)
        .toArray();

    return { totalCount, pages };
}

/**
 * Updates the page
 */
export const updatePage = async (uid: string, data: any): Promise<Page> => {

    deleteUndefinedKeys(data)

    const page = await fetchPage(uid)

    // @ts-ignore
    delete page._id;

    const updatedPage = {
        ...page,
        ...data,
        ...{ uid },
    }

    await pageSchema.validateAsync(updatedPage)
    await mongoDb.collection(collectionNames.pages).updateOne({ uid: page.uid }, {
        $set: updatedPage,
    })

    return updatedPage;
}