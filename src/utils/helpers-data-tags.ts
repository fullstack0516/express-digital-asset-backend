import { BlacklistedDataCategory, blacklistedDataCategorySchema } from './../models/blacklisted-data-category';
import { collectionNames, mongoDb } from './helpers-mongo';
import { UserDataTag, userDataTagSchema } from './../models/user-data-tag';
import { createUid } from './helpers';
import { logError, logWarning } from './logger';
import Page from '../models/page'
import language from '@google-cloud/language'
import { DataTag } from '../models/data-tag';
import ContentSection, { ContentHeader } from '../models/content-section';
import { fetchPage } from './helpers-pages';
import { RouteError } from './route-error';
import { fetchUser } from './helpers-users';

// Instantiates a client
const client = new language.LanguageServiceClient();

export const createPageDataTags = async (page: Page): Promise<{ [tagString: string]: DataTag }> => {

    try {

        let allHtml = ''

        page.contentSections.forEach((section) => {
            if (section.type == 'header') {
                allHtml += (section as ContentSection<ContentHeader>).content.text.html
            }
            if (section.type == 'text-block') {
                allHtml += (section as ContentSection<ContentHeader>).content.text.html
            }
            if (section.type == 'text-image-left') {
                allHtml += (section as ContentSection<ContentHeader>).content.text.html
            }
            if (section.type == 'text-image-right') {
                allHtml += (section as ContentSection<ContentHeader>).content.text.html
            }
        })

        const document = {
            content: allHtml,
            // HTML = 2, PLAIN_TEXT = 1, 0, unspecifed.
            type: 2,
        };

        // Detects the category of the text.
        const [categoriesResults] = await client.classifyText({ document: document });

        // Get the content categories.
        const contentCategories: string[] = [];
        (categoriesResults.categories ?? []).forEach((category) => {
            if (category.name && category.confidence) {
                // Each tag can have multiple parts, such as:
                // Example: /Autos & Vehicles/Bicycles & Accessories
                // You can find more examples here // https://cloud.google.com/natural-language/docs/categories
                const categoryNames = category.name.split('/')
                categoryNames.forEach((eachCategoryName) => {
                    if (eachCategoryName) {
                        contentCategories.push(eachCategoryName)
                    }
                })
            }
        })

        if (contentCategories.length == 0) {
            logWarning('Page content had no categories. Url was: ' + page.url)
        }

        const tags: { [tagString: string]: DataTag } = {};

        // Detects the tags of the text
        const [entitiesResults] = await client.analyzeEntities({ document: document });

        (entitiesResults.entities ?? []).forEach((entity) => {
            if (entity.name && entity.salience > 0) {
                const name = entity.name;

                if (name && entity.type && entity.type != 'OTHER' && entity.type != 'EVENT' && entity.type != 'NUMBER') {
                    let count = 1;
                    if (tags[name]) {
                        count = tags[name].count + 1;
                    }
                    tags[name] = {
                        uid: createUid(),
                        tagString: name,
                        tagCreatedIso: new Date().toISOString(),
                        contentCategories,
                        tagScore: entity.salience,
                        count,
                    }
                }
            }
        })

        return tags
    } catch (e) {
        logError(e)
        return {}
    }
}

export const recordDataTagsForUser = async (pageUid: string, userUid: string) => {
    const page = await fetchPage(pageUid)
    const dataTags = page.dataTags;

    if (Object.keys(dataTags).length === 0) {
        throw new RouteError('no-data-tags', 'The page had no data tags.')
    }

    const blacklisted = await mongoDb.collection<BlacklistedDataCategory>(collectionNames.blacklistedUserCategories).find({
        userUid,
    }).toArray()

    // Check the user exists.
    const user = await fetchUser(userUid)

    const userDataTags: UserDataTag[] = []

    Object.entries(page.dataTags).forEach((dataTagEntry) => {
        const [key, dataTag] = dataTagEntry;
        const userDataTag: UserDataTag = {
            uid: createUid(),
            contentCategories: dataTag.contentCategories,
            count: dataTag.count,
            tagCreatedIso: dataTag.tagCreatedIso,
            tagRecordedForUserIso: new Date().toISOString(),
            tagScore: dataTag.tagScore,
            tagString: dataTag.tagString,
            userUid: user.uid,
            companyId: 'awake'
        }
        if (!userDataTagSchema.validate(userDataTag).error) {

            let blacklistedTag = false;
            blacklisted.forEach((categoryBlackListed) => {
                userDataTag.contentCategories.forEach((newTagCategory) => {
                    if (categoryBlackListed.category == newTagCategory) {
                        blacklistedTag = true;
                    }
                })
            })
            if (!blacklistedTag) {
                // It's not black listed.
                userDataTags.push(userDataTag)
            }

        } else {
            logError('User DataTag had errors', userDataTagSchema.validate(userDataTag).error)
        }
    })

    if (userDataTags.length !== 0) {
        await mongoDb.collection<UserDataTag>(collectionNames.userDataTags).insertMany(userDataTags)
    }
}

export const fetchMyData = async (userUid: string, props: { fromIso: string, category?: string }): Promise<{ [category: string]: UserDataTag[] }> => {

    const { fromIso, category } = props;

    let tags: UserDataTag[]

    if (category) {
        tags = await mongoDb.collection<UserDataTag>(collectionNames.userDataTags).find({
            userUid,
            tagRecordedForUserIso: { $lte: fromIso },
            contentCategories: { $in: [category] }
        })
            .sort({
                tagRecordedForUserIso: -1,
            })
            .limit(200)
            .toArray()

    } else {
        tags = await mongoDb.collection<UserDataTag>(collectionNames.userDataTags).find({
            userUid,
            tagRecordedForUserIso: { $lte: fromIso },
        })
            .sort({
                tagRecordedForUserIso: -1,
            })
            .limit(200)
            .toArray()
    }

    const tagsByCategory: { [category: string]: UserDataTag[] } = {};
    tags.forEach((tag) => {
        tag.contentCategories.forEach((tagCategory) => {
            if (!tagsByCategory[tagCategory]) {
                tagsByCategory[tagCategory] = [];
            }
            tagsByCategory[tagCategory].push(tag)
        })
    })

    return tagsByCategory;
}

/**
 * This will count the data points
 */
export const countOfDataPoints = async (userUid: string): Promise<number> => {
    return await mongoDb.collection<UserDataTag>(collectionNames.userDataTags).find({
        userUid,
    }).count()
}

/**
 * This will delete the data.
 */
export const blacklistCategory = async (category: string, userUid: string) => {

    // Check it doesn't exist
    const blackListedCategory = await mongoDb.collection<BlacklistedDataCategory>(collectionNames.blacklistedUserCategories).findOne({
        category,
        userUid,
    })
    if (blackListedCategory) {
        throw new RouteError('already-blacklisted', 'Already blacklisted this datacategory')
    }

    const blacklistCategoryNew: BlacklistedDataCategory = {
        category,
        userUid,
    }
    await blacklistedDataCategorySchema.validateAsync(blacklistCategoryNew)
    await mongoDb.collection<BlacklistedDataCategory>(collectionNames.blacklistedUserCategories).insertOne(blacklistCategoryNew)

    // Delete the data.
    await mongoDb.collection<UserDataTag>(collectionNames.userDataTags).deleteMany({
        userUid,
        contentCategories: { $in: [category] },
    })
}


export const unblacklistCategory = async (category: string, userUid: string) => {
    await mongoDb.collection<BlacklistedDataCategory>(collectionNames.blacklistedUserCategories).deleteMany({
        userUid,
        category,
    })
}


export const getBlacklistedCategories = async (userUid: string) => {
    const blackListedCategories = await mongoDb.collection<BlacklistedDataCategory>(collectionNames.blacklistedUserCategories).find({
        userUid,
    }).toArray()
    return blackListedCategories;
}
