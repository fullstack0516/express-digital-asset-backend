import { Subscription, subscriptionSchema } from './../models/subscription';
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import Page from "../models/page";
import Site, { siteSchema } from "../models/site";
import { deleteFileViaUrl } from "./helper-storage";
import { asyncForEach, createUid, deleteUndefinedKeys } from "./helpers";
import { collectionNames, mongoDb } from "./helpers-mongo";
import { deletePage, fetchNewPages } from "./helpers-pages";
import { randomDummyProfilePhoto } from "./helpers-photos";
import { RouteError } from "./route-error";

/**
 * Returns undefined if there's no site.
 */
export const fetchSite = async (uid: string): Promise<Site> => {
    let site = await mongoDb.collection<Site | null>(collectionNames.sites).findOne({ uid })
    if (!site) {
        throw new RouteError('no-site', 'No site exists.')
    }
    // @ts-ignore
    delete site._id
    return site;
}

/**
 * Returns undefined if there's no site.
 */
export const fetchSiteViaUrl = async (url: string): Promise<Site> => {
    let site = await mongoDb.collection<Site | null>(collectionNames.sites).findOne({ url })
    if (!site) {
        throw new RouteError('no-site', 'No site exists.')
    }
    // @ts-ignore
    delete site._id
    return site;
}

export const isSiteOwner = async (siteUid: string, userUid: string) => {
    const site = await fetchSite(siteUid)

    if (site.siteOwnersUids.filter((uid) => userUid).length === 0) {
        throw new RouteError('not-site-owner', 'The user is not a site owner.')
    }
    return true;
}

/**
 * Removes the user from the site or deletes it if they are the only one.
 */
export const deleteUserSites = async (userUid: string) => {
    const sites = await mongoDb.collection<Site>(collectionNames.sites).find({ siteOwnersUids: { $in: [userUid], } }).toArray()

    await asyncForEach(sites, async site => {
        if (site.siteOwnersUids.length > 1) {
            // Just remove the user.
            site.siteOwnersUids = site.siteOwnersUids.filter((owner) => owner != userUid)
            await updateSite(site.uid, { siteOwnersUids: site.siteOwnersUids })
        } else {
            await deleteSite(site.uid)
        }
    })
}

/**
 * Deletes all the sensative content
 */
export const deleteSite = async (uid: string) => {

    const siteName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '_',
        length: 1,
        style: 'lowerCase',
    });

    const site = await fetchSite(uid)
    await deleteFileViaUrl(site.siteIcon.url)

    // Delete the sensative info.
    await updateSite(uid, {
        name: 'deleted-' + siteName,
        siteIcon: randomDummyProfilePhoto(),
        description: '',
        url: 'deleted-' + createUid(),
        totalVisits: 0,
        totalEarnings: 0,
        siteOwnersUids: [],
        isDeleted: true,
    })

    // Delete pages
    const pagesToDelete = await mongoDb.collection<Page>(collectionNames.pages).find({ siteUid: uid }).toArray()
    await asyncForEach(pagesToDelete, async (page) => {
        await deletePage(page.uid)
    })
}


export const updateSite = async (uid: string, data: any): Promise<Site> => {

    deleteUndefinedKeys(data)

    const site = await fetchSite(uid)

    // @ts-ignore
    delete site._id;

    const updatedSite = {
        ...site,
        ...data,
        ...{
            lastSiteUpdatedIso: new Date().toISOString(),
        }
    }

    await siteSchema.validateAsync(updatedSite)
    await mongoDb.collection<Site>(collectionNames.sites).updateOne({ uid: site.uid }, {
        $set: updatedSite,
    })

    return updatedSite;
}


export const isSiteUrlUnique = async (url: string): Promise<boolean> => {
    const site = await mongoDb.collection(collectionNames.sites).findOne({ url })
    return !site;
}


export const subscribeUserToSite = async (userUid: string, siteUid: string) => {
    // Check it exists.
    await fetchSite(siteUid)
    const sub = await mongoDb.collection<Subscription>(collectionNames.subscriptions).findOne({ userUid, siteUid });
    if (sub) {
        throw new RouteError('already-subscribed', 'The subscription already does exist.')
    }

    const subscription: Subscription = {
        uid: createUid(),
        subscriptionIso: new Date().toISOString(),
        siteUid,
        userUid,
    }

    await subscriptionSchema.validateAsync(subscription)
    await mongoDb.collection(collectionNames.subscriptions).insertOne(subscription)
}

export const checkUserSubscription = async (userUid: string, siteUid: string) => {
    // Check it exists.
    await fetchSite(siteUid)
    const sub = await mongoDb.collection<Subscription>(collectionNames.subscriptions).findOne({ userUid, siteUid });
    return !!sub;
}


export const unsubscribeUserToSite = async (userUid: string, siteUid: string) => {
    const sub = await mongoDb.collection<Subscription>(collectionNames.subscriptions).findOne({ userUid, siteUid });
    if (!sub) {
        throw new RouteError('the-sub-does-not-exist', 'The subscription does not exist.')
    }
    await mongoDb.collection(collectionNames.subscriptions).deleteOne({ uid: sub.uid })
}


export const fetchSubscribedSites = async (userUid: string) => {

    const subs = await mongoDb.collection<Subscription>(collectionNames.subscriptions).find({
        userUid,
    }).toArray()

    const sites: Site[] = [];
    await asyncForEach(subs, async eachSub => {
        sites.push(await fetchSite(eachSub.siteUid))
    })
    return sites;
}


export const fetchSubscribedSitesNewPages = async (userUid: string) => {

    const subs = await mongoDb.collection<Subscription>(collectionNames.subscriptions).find({
        userUid,
    }).toArray()

    let pages: Page[] = [];
    await asyncForEach(subs, async eachSub => {
        const newPages = await fetchNewPages(eachSub.siteUid)
        pages = pages.concat(newPages)
    })
    return pages;
}
