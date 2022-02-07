import Page from "../models/page";
import Site from "../models/site";
import { collectionNames, mongoDb } from "./helpers-mongo";

export const fetchPopularPages = async (itemNumber: number, category?: string): Promise<{
    pages: Page[],
    itemNumber: number
}> => {
    const loadCount = 16
    let query: any = {
        totalVisits: { $gte: 1 },
        isFlagged: false,
        isBanned: false,
        isDeleted: false,
        isPublished: true,
    }

    if (category) {
        query.contentCategories = { $in: [category] }
    }

    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({
            totalVisits: -1,
        })
        .skip(itemNumber)
        .limit(loadCount)
        .toArray()

    return {
        pages: newPages,
        itemNumber: itemNumber + loadCount
    };
}

export const fetchPopularSites = async (totalVisits?: number) => {
    let query: any = {
        totalVisits: { $gte: 1 },
        isDeleted: false,
    }

    if (totalVisits) {
        query.totalVisits = { $lte: totalVisits }
    }

    const sites = await mongoDb.collection<Site>(collectionNames.sites).find(query)
        .sort({
            totalVisits: -1,
        })
        .limit(8)
        .toArray()
    return sites;
}

export const fetchNewPages = async (category?: string, fromIso?: string) => {

    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    let query: any = {
        createdIso: { $gte: daysNAgo.toISOString() },
        isFlagged: false,
        isBanned: false,
        isDeleted: false,
        isPublished: true,
    }

    if (category) {
        query.contentCategories = { $in: [category] }
    }

    if (fromIso) {
        query.createdIso = { ...query.createdIso, $lte: fromIso }
    }

    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({
            createdIso: -1,
        })
        .limit(16)
        .toArray()
    return newPages;
}

export const fetchTrendingPages = async (itemNumber: number, category?: string): Promise<{
    pages: Page[],
    itemNumber: number
}> => {
    const loadCount = 16
    const daysNAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    let query: any = {
        isFlagged: false,
        isBanned: false,
        isDeleted: false,
        isPublished: true,
        createdIso: { $gte: daysNAgo.toISOString() },
    }

    if (category) {
        query.contentCategories = { $in: [category] }
    }

    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({
            totalVisits: -1,
        })
        .skip(itemNumber)
        .limit(loadCount)
        .toArray()

    return {
        pages: newPages,
        itemNumber: itemNumber + loadCount
    };
}

export const fetchHomePages = async (itemNumber: number, category?: string): Promise<{
    pages: Page[],
    itemNumber: number
}> => {
    const loadCount = 16
    const daysNAgo = new Date(Date.now() - 24 * 24 * 60 * 60 * 1000)
    let query: any = {
        isFlagged: false,
        isBanned: false,
        isDeleted: false,
        isPublished: true,
        createdIso: { $gte: daysNAgo.toISOString() },
    }

    if (category) {
        query.contentCategories = { $in: [category] }
    }

    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({
            totalVisits: -1,
        })
        .skip(itemNumber)
        .limit(loadCount)
        .toArray()

    return {
        pages: newPages,
        itemNumber: itemNumber + loadCount
    };
}
