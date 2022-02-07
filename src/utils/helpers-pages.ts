import { createPageDataTags } from './helpers-data-tags';
import { Report } from './../models/report';
import { greyImage } from '../routes/page-section-add';
import { logError } from './logger';
import { ContentHeader, ContentTextImageLeft, ContentTextImageRight, ContentTypes, ContentTextBlock, ContentVideoRowEmbed, ContentTripleImageCol } from './../models/content-section';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import ContentSection, { ContentImageRow } from '../models/content-section';
import Page, { pageSchema } from '../models/page';
import { PageLike } from '../models/page-likes';
import { collectionNames, mongoDb } from '../utils/helpers-mongo';
import { deleteFileViaUrl } from './helper-storage';
import { asyncForEach, createUid, deleteUndefinedKeys, markdownToHtml } from './helpers';
import { RouteError } from './route-error';
import { fetchSite } from './helpers-sites';
import { updateUser } from './helpers-users';
import Site from '../models/site';

export const isPageUrlUnique = async (url: string): Promise<boolean> => {
    const page = await mongoDb.collection(collectionNames.pages).findOne({ url })
    return !page
}

/**
 * Returns undefined if there's no page.
 */
export const fetchPage = async (uid: string): Promise<Page> => {
    let page = await mongoDb.collection<Page | null>(collectionNames.pages).findOne({ uid })
    if (!page) {
        throw new RouteError('no-page', 'No page exists.')
    }
    // @ts-ignore
    delete page._id
    return page;
}


/**
 * Returns undefined if there's no page.
 */
export const fetchPageViaUrl = async (siteUrl: string, pageUrl: string): Promise<Page> => {

    const site = await mongoDb.collection<Site>(collectionNames.sites).findOne({
        url: siteUrl,
    })
    if (!site) {
        throw new RouteError('no-site', 'No site exists from url ' + siteUrl)
    }

    let page = await mongoDb.collection<Page>(collectionNames.pages).findOne({
        url: pageUrl,
        siteUid: site.uid,
    })
    if (!page) {
        throw new RouteError('no-page', 'No page exists.')
    }
    // @ts-ignore
    delete page._id
    return page;
}

/**
 * Updates the page
 */
export const updatePage = async (uid: string, data: any): Promise<Page> => {

    deleteUndefinedKeys(data)

    if (data.contentDraftSections && data.contentDraftSections.length > 80) {
        throw new RouteError('too-many-sections', 'The user submitted too many content draft sections');
    }

    const page = await fetchPage(uid)

    // @ts-ignore
    delete page._id;

    const updatedPage = {
        ...page,
        ...data,
        ...{ uid },
        ...{
            lastUpdateIso: new Date().toISOString(),
        }
    }

    await pageSchema.validateAsync(updatedPage)
    await mongoDb.collection(collectionNames.pages).updateOne({ uid: page.uid }, {
        $set: updatedPage,
    })

    return updatedPage;
}

/**
 * Deletes all the sensative content
 */
export const deletePage = async (uid: string) => {

    const pageName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '_',
        length: 1,
        style: 'lowerCase',
    });

    const page = await fetchPage(uid)

    // Add them together since they share the same content urls, and same uids.
    const allSections = {}
    page.contentSections.forEach((p) => {
        allSections[p.uid] = p;
    })
    page.contentDraftSections.forEach((p) => {
        allSections[p.uid] = p;
    })
    await asyncForEach(Object.keys(allSections), async eachSectionKey => {
        await deleteContentSectionFiles(allSections[eachSectionKey])
    })

    // Delete the sensative info.
    await updatePage(uid, {
        title: 'deleted-' + pageName,
        description: '',
        url: 'deleted-' + createUid(),
        totalVisits: 0,
        totalEarnings: 0,
        isDeleted: true,
        dataTags: {},
        contentSections: [],
        contentDraftSections: [],
    })
}

/**
 * Deleting draft images should not delete public images.
 */
const deleteImageFileIfNotPublic = async (pageUid: string, url: string) => {
    const page = await fetchPage(pageUid)
    let isPublic = false;
    page.contentSections.forEach((cs) => {
        if (cs.type === 'triple-image-col') {
            (cs.content as any)?.images.forEach((img) => {
                if (img?.url === url) {
                    isPublic = true;
                }
            })
        }
        else {
            const publicUrl = (cs.content as any)?.image?.url;
            if (publicUrl && publicUrl === url) {
                isPublic = true;
            }
        }
    })
    if (!isPublic) {
        deleteFileViaUrl(url)
    }
}


export const publishPage = async (pageUid: string) => {
    try {
        let page = await fetchPage(pageUid)

        const oldLiveSections = page.contentSections;
        const draftSections = page.contentDraftSections;

        await updatePage(pageUid, { contentSections: draftSections, lastPublishIso: new Date().toISOString(), isPublished: true })

        page = await fetchPage(pageUid)
        const dataTags = await createPageDataTags(page);

        // Get the content categories if the exist from the datatags
        let contentCategories = []
        if (Object.keys(dataTags).length > 0) {
            contentCategories = dataTags[Object.keys(dataTags)[0]].contentCategories
        }

        page = await fetchPage(pageUid)
        await updatePage(pageUid, { dataTags, contentCategories })

        // Find the live pages that are removed. Remove their file/image content.
        const removedSections = oldLiveSections.filter((oldLiveSection) => {
            if (draftSections.filter((draftSection) => draftSection.uid === oldLiveSection.uid).length === 1) {
                return false
            }
            return true;
        })

        // Remove files from the removed sections.
        await asyncForEach(removedSections, async removedSection => {
            const publicMediaLink = (removedSection.content as any)?.image?.url
            if (publicMediaLink) {
                await deleteImageFileIfNotPublic(pageUid, publicMediaLink)
            }
        })
    } catch (e) {
        throw e;
    }
}


/**
 * The text should be markdown.
 */
export const updateContent = async (props: {
    pageUid: string,
    contentSectionUid: string,
    newImageUrl?: string,
    newText?: string,
    newVideoUrl?: string,
    deleteImage?: boolean,
    deleteVideoUrl,
    nthImage?: number
}): Promise<ContentSection<ContentTypes>> => {
    const { pageUid, contentSectionUid, newImageUrl, newText, deleteImage, newVideoUrl, deleteVideoUrl, nthImage } = props;

    const page = await fetchPage(pageUid)

    const updateSection = async (contentSection: ContentSection<ContentTypes>) => {
        const contentDraftSections = page.contentDraftSections.map((cs) => {
            if (cs.uid === contentSection.uid) {
                return contentSection;
            }
            return cs;
        })
        await updatePage(page.uid, { contentDraftSections })
        return contentSection;
    }

    const contentSection = page.contentDraftSections.filter((cs) => cs.uid === contentSectionUid)[0]

    if (contentSection.type == 'header') {
        let updatedSection = contentSection as ContentSection<ContentHeader>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'image-row') {
        let updatedSection = contentSection as ContentSection<ContentImageRow>;
        if (newImageUrl || deleteImage) {
            const oldImage = updatedSection.content.image;
            updatedSection.content.image = {
                type: 'photo',
                url: deleteImage ? greyImage : newImageUrl,
            };
            await deleteImageFileIfNotPublic(pageUid, oldImage.url)
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'triple-image-col') {
        let updatedSection = contentSection as ContentSection<ContentTripleImageCol>;
        if (newImageUrl || deleteImage) {
            let oldImage;
            const url = deleteImage ? greyImage : newImageUrl;
            if (nthImage !== undefined && nthImage <= 2) {
                oldImage = updatedSection.content.images[nthImage];
                updatedSection.content.images[nthImage] = { type: 'photo', url };
                await deleteImageFileIfNotPublic(pageUid, oldImage.url)
            }
            else {
                throw new RouteError('undefined-image-position', 'image position is required for tirple-image-col content section');
            }

        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'text-block') {
        let updatedSection = contentSection as ContentSection<ContentTextBlock>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'text-image-left') {
        let updatedSection = contentSection as ContentSection<ContentTextImageLeft>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        if (newImageUrl || deleteImage) {
            const oldImage = updatedSection.content.image;
            updatedSection.content.image = {
                type: 'photo',
                url: deleteImage ? greyImage : newImageUrl,
            };
            await deleteImageFileIfNotPublic(pageUid, oldImage.url)
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'text-image-right') {
        let updatedSection = contentSection as ContentSection<ContentTextImageRight>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        if (newImageUrl || deleteImage) {
            const oldImage = updatedSection.content.image;
            updatedSection.content.image = {
                type: 'photo',
                url: deleteImage ? greyImage : newImageUrl,
            };
            await deleteImageFileIfNotPublic(pageUid, oldImage.url)
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'video-row-embed-only') {
        let updatedSection = contentSection as ContentSection<ContentVideoRowEmbed>;
        if (newVideoUrl) {
            updatedSection.content.link = newVideoUrl
        }
        if (deleteVideoUrl) {
            updatedSection.content.link = '';
        }
        return await updateSection(updatedSection)
    }

    throw new RouteError('unknown-content-section', 'Either we could not find this content section on the page, or its an unknown type.')
}


export const deleteContentSection = async (pageUid: string, contentSectionUid: string, deletePublished: boolean) => {

    const page = await fetchPage(pageUid)

    let contentDraftSections = page.contentDraftSections;

    const deletedSection = contentDraftSections.filter(i => i.uid == contentSectionUid)[0];
    contentDraftSections = contentDraftSections.filter(i => i.uid != contentSectionUid);

    await updatePage(page.uid, { contentDraftSections })

    // If the content is published; don't delete the file.
    if (!deletePublished) {
        if (page.contentSections.find((cs) => cs?.uid === contentSectionUid)) {
            return;
        }
    }

    await deleteContentSectionFiles(deletedSection)
}

/**
 * Remove all files reguardless of if it's public or not
 */
const deleteContentSectionFiles = async (contentSection: ContentSection<any>) => {
    try {
        if (contentSection.type == 'image-row') {
            await deleteFileViaUrl((contentSection as ContentSection<ContentImageRow>).content.image.url)
        }
        if (contentSection.type == 'text-image-right') {
            await deleteFileViaUrl((contentSection as ContentSection<ContentTextImageRight>).content.image.url)
        }
        if (contentSection.type == 'text-image-left') {
            await deleteFileViaUrl((contentSection as ContentSection<ContentTextImageLeft>).content.image.url)
        }
    } catch (e) {
        logError('Could not delete content section file. Might be shared with draft.', e)
    }
}


export const recordImpression = async (pageUid: string) => {
    const page = await fetchPage(pageUid)
    const site = await fetchSite(page.siteUid)

    // Update page impressions
    await mongoDb.collection(collectionNames.pages).updateOne(
        { uid: pageUid }, {
        $inc: {
            totalImpressions: 1,
        }
    })
    // Update site impressions
    await mongoDb.collection(collectionNames.sites).updateOne(
        { uid: page.siteUid }, {
        $inc: {
            totalImpressions: 1,
        }
    })
    await asyncForEach(site.siteOwnersUids, async (ownerUid) => {
        // Update user impressions.
        await mongoDb.collection(collectionNames.users).updateOne(
            { uid: ownerUid }, {
            $inc: {
                totalImpressionsOnSites: 1,
            }
        })
    })
}

export const recordVisit = async (pageUid: string) => {
    const page = await fetchPage(pageUid)
    const site = await fetchSite(page.siteUid)

    // Update page impressions
    await mongoDb.collection(collectionNames.pages).updateOne(
        { uid: pageUid }, {
        $inc: {
            totalVisits: 1,
        }
    })
    // Update site impressions
    await mongoDb.collection(collectionNames.sites).updateOne(
        { uid: page.siteUid }, {
        $inc: {
            totalVisits: 1,
        }
    })
    await asyncForEach(site.siteOwnersUids, async (ownerUid) => {
        // Update user impressions.
        await mongoDb.collection(collectionNames.users).updateOne(
            { uid: ownerUid }, {
            $inc: {
                totalVisitsOnSites: 1,
            }
        })
    })
}


export const reportPage = async (pageUid: string, userUid: string, reasonDesc: string) => {
    // Check page exists.
    await fetchPage(pageUid)

    const report: Report = {
        uid: createUid(),
        createdIso: new Date().toISOString(),
        pageUid,
        userUid,
        reasonDesc,
    }

    const existingReport = await mongoDb.collection<Report>(collectionNames.reports).find({ pageUid: report.pageUid, userUid: report.userUid }).toArray();
    if (existingReport.length > 0) {
        throw new RouteError('already-reported', 'The user has already reported this page.')
    }

    await mongoDb.collection(collectionNames.pages).updateOne(
        { uid: pageUid }, {
        $inc: {
            numberOfReports: 1,
        }
    })

    // Number of total views vs auto-flag.
    const page = await fetchPage(pageUid)
    if (page.totalVisits > 10) {
        // 10% is auto-flag.
        const percentageReported = page.numberOfReports / page.totalVisits;
        if (percentageReported > 0.10) {
            await updatePage(pageUid, { isFlagged: true })
            await updateUser(userUid, { isFlagged: true })
        }
    }

    await mongoDb.collection<Report>(collectionNames.reports).insertOne(report)
}

export const likePage = async (pageUid: string, userUid: string, liked: -1 | 0 | 1) => {
    // Check page exists.
    await fetchPage(pageUid)

    const newLike: PageLike = {
        uid: createUid(),
        createdIso: new Date().toISOString(),
        pageUid,
        userUid,
        liked: liked
    }

    // check user voted before
    const existingLike = await mongoDb.collection<PageLike>(collectionNames.pageLikes).findOne({ pageUid: pageUid, userUid: userUid })
    if (existingLike) {
        delete newLike.uid;
        // update the liked
        await mongoDb.collection<PageLike>(collectionNames.pageLikes).updateOne(
            { uid: existingLike.uid }, {
            $set: newLike
        })
        // update the likes of page according to the value of old and new liked
        await mongoDb.collection(collectionNames.pages).updateOne(
            { uid: pageUid }, {
            $inc: {
                likes: newLike.liked - existingLike.liked,
            }
        })
        return;
    }

    // create the new liked
    await mongoDb.collection<PageLike>(collectionNames.pageLikes).insertOne(newLike)
    // increase the likes of page
    await mongoDb.collection(collectionNames.pages).updateOne(
        { uid: pageUid }, {
        $inc: {
            likes: newLike.liked,
        }
    })

}


export const fetchSitePages = async (siteUid: string, fromIso: string) => {
    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find({
        siteUid,
        createdIso: { $lte: fromIso },
        isDeleted: false,
    })
        .sort({
            createdIso: -1,
        })
        .limit(20)
        .toArray()
    return newPages;
}


export const fetchNewPages = async (siteUid: string, fromIso?: string) => {
    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    let query: any = {
        siteUid,
        isPublished: true,
        isDeleted: false,
        createdIso: { $gte: daysNAgo.toISOString() },
    }

    if (fromIso) {
        query.createdIso = { ...query.createdIso, $lte: fromIso }
    }

    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({
            createdIso: -1,
        })
        .limit(8)
        .toArray()
    return newPages;
}

export const fetchPopularPages = async (siteUid: string, totalVisits?: number) => {
    let query: any = {
        siteUid,
        isPublished: true,
        isDeleted: false,
    }

    if (totalVisits) {
        query.totalVisits = { $lte: totalVisits }
    }

    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({
            totalVisits: -1,
        })
        .limit(8)
        .toArray()
    return newPages;
}

export const fetchTrendingPages = async (siteUid: string, totalVisits?: number) => {
    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    let query: any = {
        siteUid,
        isPublished: true,
        isDeleted: false,
        createdIso: { $gte: daysNAgo.toISOString() },
    }

    if (totalVisits) {
        query.totalVisits = { $lte: totalVisits }
    }

    const newPages = await mongoDb.collection<Page>(collectionNames.pages).find(query)
        .sort({
            totalVisits: -1,
        })
        .limit(8)
        .toArray()
    return newPages;
}