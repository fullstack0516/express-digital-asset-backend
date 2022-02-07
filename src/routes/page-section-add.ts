import ContentSection, { ContentTypes, ContentSectionTypes, ContentHeader, ContentTextBlock, ContentTextImageLeft, ContentVideoRowEmbed, ContentTextImageRight, ContentTripleImageCol } from '../models/content-section';
import { Request, Response } from 'express';
import * as Joi from 'joi';
import { ContentImageRow, sectionTypesSchema } from '../models/content-section';
import { fetchPage, updatePage } from '../utils/helpers-pages';
import { isSiteOwner } from '../utils/helpers-sites';

import { createUid } from '../utils/helpers';

export const greyImage = 'https://storage.googleapis.com/trivsel-a74a1.appspot.com/dummy_photos/dummy_content_image.png';

const scheme = Joi.object({
    pageUid: Joi.string().required(),
    contentSectionType: sectionTypesSchema.required(),
    index: Joi.number().integer().min(0).optional(),
})

/**
 * @api {post} api/page-section-add Page Add Content Block to drafts
 * @apiDescription 
 *      Page Add Content Block to the specific indexed position.
 *      If index doesn't exist, just add it at the end of the drafts.
 * @apiName pageSectionAdd
 * @apiGroup Pages
 * @apiPermission [authenticated]
 * @apiParamExample {json} Request-Example:
 * {
 *     pageUid: string,
 *     contentSectionType: <ContentSectionTypes>
 *     index: number
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *      page: <Page>,
 *      contentSection: <ContentSection>
 * }
 */
export const pageSectionAdd = async (req: Request, res: Response) => {

    try {
        await scheme.validateAsync(req.body);
        const { pageUid, contentSectionType, index } = req.body;

        const page = await fetchPage(pageUid)
        await isSiteOwner(page.siteUid, req.user.uid)

        const newContentSection = makeContentSection(contentSectionType);

        const contentDraftSections = page.contentDraftSections;
        if (index !== undefined) {
            contentDraftSections.splice(index, 0, newContentSection);
        }
        else {
            contentDraftSections.push(newContentSection);
        }

        await updatePage(page.uid, { contentDraftSections })

        return res.json({
            page: (await fetchPage(page.uid)),
            contentSection: newContentSection,
        })

    } catch (e) {
        throw e;
    }
};

const makeContentSection = (type: ContentSectionTypes): ContentSection<ContentTypes> => {

    let section;

    if (type == 'header') {
        (section as ContentHeader) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            }
        }
    }

    if (type == 'image-row') {
        (section as ContentImageRow) = {
            uid: createUid(),
            image: {
                url: greyImage,
                type: 'photo',
            }
        }
    }

    if (type == 'triple-image-col') {
        (section as ContentTripleImageCol) = {
            uid: createUid(),
            images: [
                // full-image
                { url: greyImage, type: 'photo', },
                // half-first-image
                { url: greyImage, type: 'photo', },
                // half-second-image
                { url: greyImage, type: 'photo', }
            ]
        }
    }

    if (type == 'text-block') {
        (section as ContentTextBlock) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            }
        }
    }

    if (type == 'text-image-left') {
        (section as ContentTextImageLeft) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            },
            image: {
                url: greyImage,
                type: 'photo',
            }
        }
    }

    if (type == 'text-image-right') {
        (section as ContentTextImageRight) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            },
            image: {
                url: greyImage,
                type: 'photo',
            }
        }
    }

    if (type == 'video-row-embed-only') {
        (section as ContentVideoRowEmbed) = {
            uid: createUid(),
            link: ''
        }
    }

    const contentSection: ContentSection<ContentTypes> = {
        uid: createUid(),
        type,
        content: section,
    }

    return contentSection;
}
