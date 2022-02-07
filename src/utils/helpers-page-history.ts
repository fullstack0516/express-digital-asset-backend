import { pageHistorySchema } from './../models/page-history';
import { fetchPage } from './helpers-pages';
import { collectionNames, mongoDb } from './helpers-mongo';
import { PageHistory } from '../models/page-history';
import { createUid } from './helpers';
import { fetchSite } from './helpers-sites';


/**
 * Update the users history. If the item exists update the time, else create new.
 * We return strings to refect what action happened.
 */
export const updateHistory = async (pageUid: string, userUid: string): Promise<'updated' | 'createdNew' | 'pageChanged' | 'pageOwner'> => {

    const page = await fetchPage(pageUid)

    if (page.pageOwner === userUid) {
        return 'pageOwner'
    }

    let pageHistory = await mongoDb.collection<PageHistory>(collectionNames.pageHistory).findOne({
        pageUid,
        userUid,
    })


    if (pageHistory) {
        await mongoDb.collection<PageHistory>(collectionNames.pageHistory).updateOne(
            { uid: pageHistory.uid },
            {
                $set: {
                    lastUpdateIso: new Date().toISOString()
                },
                $inc: { numberOfVisits: 1 }
            }
        )
        const pagePublishChanged = page.lastPublishIso != pageHistory.lastPagePublishIso;
        // if page publish date was changed, update pageHistory as well, so that make sure datapoints can not be added several times
        if (pagePublishChanged) {
            await mongoDb.collection<PageHistory>(collectionNames.pageHistory).updateOne(
                { uid: pageHistory.uid },
                {
                    $set: { lastPagePublishIso: page.lastPublishIso },
                }
            )
        }
        return pagePublishChanged ? 'pageChanged' : 'updated'
    }

    pageHistory = {
        uid: createUid(),
        userUid,
        numberOfVisits: 1,
        createdIso: new Date().toISOString(),
        lastUpdateIso: new Date().toISOString(),
        lastPagePublishIso: page.lastPublishIso,
        pageUid: page.uid,
        pageUrl: page.url,
        siteUid: page.siteUid,
        siteUrl: await (await fetchSite(page.siteUid)).url,
    }
    await pageHistorySchema.validateAsync(pageHistory)
    await mongoDb.collection<PageHistory>(collectionNames.pageHistory).insertOne(pageHistory)

    return 'createdNew'
}