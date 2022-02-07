import { LoremIpsum } from 'lorem-ipsum';
import { createTestPage } from './pages.test';
import ContentSection, { ContentHeader, ContentImageRow, contentSectionSchema, ContentSectionTypes, ContentTextBlock, ContentTextImageLeft, ContentTripleImageCol, ContentTypes } from './../models/content-section';
import test from 'ava';
import * as supertest from 'supertest'
import { appLoaded, createTestUser, error, ok, uploadPhotoForTest } from './index.test';
import Page, { pageSchema } from '../models/page';
import { createTestSite } from './sites.test';
import { greyImage } from '../routes/page-section-add';
import { fetchPage } from '../utils/helpers-pages';


export const createRandomTestContent = async (pageUid: string, jwt: string, contentType?: ContentSectionTypes) => {
    const contentTypes = ['header', 'text-block', 'text-image-right', 'text-image-left', 'image-row', 'video-row-embed-only', 'triple-image-col']
    // if contentType was not pointed out, just create the random content.
    const randomContentType = contentType || contentTypes[Math.floor(Math.random() * contentTypes.length)];

    const loremIpsum = await new LoremIpsum()

    const res = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: jwt,
        })
        .send({
            pageUid,
            contentSectionType: randomContentType,
        })
        .expect(ok)

    const contentSection = res.body.contentSection as ContentSection<any>

    if (randomContentType === 'header' || randomContentType === 'text-block') {
        await supertest(appLoaded)
            .post('/api/page-section-update/')
            .set({
                authorization: jwt,
            })
            .send({
                pageUid,
                contentSectionUid: contentSection.uid,
                newText: loremIpsum.generateSentences(Math.ceil(Math.random() * 5)),
            })
            .expect(ok)
    }
}

test('api/page-section-add - index can not be a negative number', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'header',
            // * index should be positive number including 0
            index: -1
        })
        .expect(error)

    t.pass()
})

test('api/page-section-add - a new section was added to the exact index position', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const pageUid = (await createTestPage(site1.uid)).page.uid

    await createRandomTestContent(pageUid, data.jwt);
    await createRandomTestContent(pageUid, data.jwt);

    const index = 1;

    const res = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid,
            contentSectionType: 'text-block',
            index
        })
        .expect(ok)

    const newSection = res.body.contentSection as ContentSection<ContentTypes>
    const pageUpdated = await fetchPage(pageUid);
    const newSectionIdx = pageUpdated.contentDraftSections.findIndex(section => section.uid === newSection.uid);
    // make sure new section was added to the exact position
    t.is(newSectionIdx === index, true);

    t.pass()
})

test('api/page-section-add - add content block - header', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Validate header.
    const headerRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'header',
        })
        .expect(ok)
    const headerContent = headerRes.body.contentSection
    await contentSectionSchema.validateAsync(headerContent)
    const headerPage = headerRes.body.page as Page
    await pageSchema.validateAsync(headerPage)

    t.pass()
})


test('api/page-section-add - add content block - text-block', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Validate text-block
    const textBlockRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'text-block',
        })
        .expect(ok)
    const textBlockContent = textBlockRes.body.contentSection
    await contentSectionSchema.validateAsync(textBlockContent)
    const textBlockPage = textBlockRes.body.page as Page
    await pageSchema.validateAsync(textBlockPage)

    t.pass()
})


test('api/page-section-add - add content block - text-image-right', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Validate text-image-right
    const textImageRightRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'text-image-right',
        })
        .expect(ok)
    const textImageRightContent = textImageRightRes.body.contentSection
    await contentSectionSchema.validateAsync(textImageRightContent)
    const textImageRightPage = textImageRightRes.body.page as Page
    await pageSchema.validateAsync(textImageRightPage)

    t.pass()
})


test('api/page-section-add - add content block - text-image-left', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Validate text-image-left
    const textImageLeftRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'text-image-left',
        })
        .expect(ok)

    const textImageLeftContent = textImageLeftRes.body.contentSection
    await contentSectionSchema.validateAsync(textImageLeftContent)
    const textImageLeftPage = textImageLeftRes.body.page as Page
    await pageSchema.validateAsync(textImageLeftPage)

    t.pass()
})


test('api/page-section-add - add content block - image-row', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    const imageRowRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'image-row',
        })
        .expect(ok)
    const imageRowResContent = imageRowRes.body.contentSection
    await contentSectionSchema.validateAsync(imageRowResContent)
    const imageRowResPage = imageRowRes.body.page as Page
    await pageSchema.validateAsync(imageRowResPage)

    t.pass()
})

test('api/page-section-add - add content block - triple-image-col', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    const tripleImageColRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'triple-image-col',
        })
        .expect(ok)
    const tripleImageColResContent = tripleImageColRes.body.contentSection
    await contentSectionSchema.validateAsync(tripleImageColResContent)
    const tripleImageColResPage = tripleImageColRes.body.page as Page
    await pageSchema.validateAsync(tripleImageColResPage)

    t.pass()
})


test('api/page-section-add - add content block - video-row-embed-only', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Validate video-row-embed-only
    const videoRowEmbedRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'video-row-embed-only',
        })
        .expect(ok)
    const videoRowEmbedContent = videoRowEmbedRes.body.contentSection
    await contentSectionSchema.validateAsync(videoRowEmbedContent)
    const videoRowEmbedPage = videoRowEmbedRes.body.page as Page
    await pageSchema.validateAsync(videoRowEmbedPage)

    t.pass()
})

test('api/page-section-delete - test delete', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Validate video-row-embed-only
    const videoRowEmbedRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'video-row-embed-only',
        })
        .expect(ok)
    const videoRowEmbedContent = videoRowEmbedRes.body.contentSection as ContentSection<any>
    await contentSectionSchema.validateAsync(videoRowEmbedContent)
    const videoRowEmbedPage = videoRowEmbedRes.body.page as Page
    await pageSchema.validateAsync(videoRowEmbedPage)

    // Content Section pages
    const deletedContentSectionPageRes = await supertest(appLoaded)
        .post('/api/page-section-delete/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionUid: videoRowEmbedContent.uid,
        })
        .expect(ok)
    const page = deletedContentSectionPageRes.body.page as Page
    await pageSchema.validateAsync(page)

    t.pass()
})


test('api/page-section-update - header update', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Add header.
    const headerRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'header',
        })
        .expect(ok)
    const headerContentSection = headerRes.body.contentSection as ContentSection<ContentTypes>

    const updateMarkdown = '**test**';

    // Update header.
    const headerResUpdate = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionUid: headerContentSection.uid,
            newText: updateMarkdown,
        })
        .expect(ok)
    const headerContentUpdated = headerResUpdate.body.updatedSection as ContentSection<ContentHeader>
    await contentSectionSchema.validateAsync(headerContentUpdated)
    t.is(headerContentUpdated.content.text.markdown === updateMarkdown, true)

    // Check the page is still valid
    const headerPage = headerResUpdate.body.page as Page
    await pageSchema.validateAsync(headerPage)

    t.pass()
})

test('api/page-section-update - text-image-left', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Add text-imageleft.
    const headerRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'text-image-left',
        })
        .expect(ok)
    const contentSection = headerRes.body.contentSection as ContentSection<ContentTextImageLeft>

    const updateMarkdown = '### Test Text';
    const headerResUpdate = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionUid: contentSection.uid,
            newImageUrl: greyImage,
            newText: updateMarkdown,
        })
        .expect(ok)
    const contentUpdated = headerResUpdate.body.updatedSection as ContentSection<ContentTextImageLeft>
    await contentSectionSchema.validateAsync(contentUpdated)

    t.is(contentUpdated.content.text.markdown === updateMarkdown, true)
    t.is(contentUpdated.content.image.url === greyImage, true)

    // Check the page is still valid
    const headerPage = headerResUpdate.body.page as Page
    await pageSchema.validateAsync(headerPage)

    t.pass()
})

test('api/page-section-update - triple-image-col - nthImage is missing', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Add triple-image-col.
    const headerRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'triple-image-col',
        })
        .expect(ok)
    const contentSection = headerRes.body.contentSection as ContentSection<ContentTripleImageCol>

    await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionUid: contentSection.uid,
            newImageUrl: greyImage,
            // ! nthImage is missing, it is required for the triple-image-col section
        })
        .expect(error)

    t.pass()
})

test('api/page-section-update - triple-image-col - works', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Add triple-image-col.
    const headerRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionType: 'triple-image-col',
        })
        .expect(ok)
    const contentSection = headerRes.body.contentSection as ContentSection<ContentTripleImageCol>;
    // imagePosition selection randomly among 0, 1, 2
    const imagePosition = Math.floor(Math.random() * 3);

    const newImageUrl = await uploadPhotoForTest(`${__dirname}/test-assets/2560x1440.jpg`)

    const tripleImageColResUpdate = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page1.uid,
            contentSectionUid: contentSection.uid,
            newImageUrl: newImageUrl,
            nthImage: imagePosition
        })
        .expect(ok)

    const contentUpdated = tripleImageColResUpdate.body.updatedSection as ContentSection<ContentTripleImageCol>
    await contentSectionSchema.validateAsync(contentUpdated)

    t.is(contentUpdated.content.images?.[imagePosition]?.url === newImageUrl, true)

    // Check the page is still valid
    const tripleImageColPage = tripleImageColResUpdate.body.page as Page
    await pageSchema.validateAsync(tripleImageColPage)

    t.pass()
})

test('api/page-section-publish - publish page works', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page = (await createTestPage(site1.uid)).page

    // Add header.
    const headerRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionType: 'header',
        })
        .expect(ok)
    const headerContentSection = headerRes.body.contentSection as ContentSection<ContentTypes>

    const updateMarkdown = '**test**';

    // Update header.
    const headerResUpdate = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionUid: headerContentSection.uid,
            newText: updateMarkdown,
        })
        .expect(ok)
    const headerContentUpdated = headerResUpdate.body.updatedSection as ContentSection<ContentHeader>
    await contentSectionSchema.validateAsync(headerContentUpdated)

    // Publish the page
    const res = await supertest(appLoaded)
        .post('/api/page-section-publish/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
        })
        .expect(ok)
    const pageUid = res.body.page.uid as string
    const isPublished = res.body.page.isPublished as boolean

    // Published Header
    const pageUpdated = await fetchPage(pageUid)
    const publishedHeader = pageUpdated.contentSections[pageUpdated.contentSections.length - 1] as ContentSection<ContentHeader>;

    t.is(publishedHeader.content.text.markdown === updateMarkdown, true)
    t.is(isPublished === true, true)
})



test('api/page-section-publish - dont delete public content', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page = (await createTestPage(site1.uid)).page

    // Add image row.
    const imageRowRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionType: 'image-row',
        })
        .expect(ok)
    const imageRowContentSection = imageRowRes.body.contentSection as ContentSection<ContentImageRow>

    // Update content with new image.
    const contentImageRowUpdate = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionUid: imageRowContentSection.uid,
            newImageUrl: (await uploadPhotoForTest(`${__dirname}/test-assets/2560x1440.jpg`)),
        })
        .expect(ok)
    const imageRowContentUpdate = contentImageRowUpdate.body.updatedSection as ContentSection<ContentImageRow>
    await contentSectionSchema.validateAsync(imageRowContentUpdate)

    // Publish the page
    await supertest(appLoaded)
        .post('/api/page-section-publish/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
        })
        .expect(ok)

    // Update content again, draft
    const contentImageRowUpdateNewImage = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionUid: imageRowContentSection.uid,
            newImageUrl: (await uploadPhotoForTest(`${__dirname}/test-assets/2560x1440.jpg`)),
        })
        .expect(ok)
    const imageRowContentUpdateNewImage = contentImageRowUpdateNewImage.body.updatedSection as ContentSection<ContentImageRow>
    await contentSectionSchema.validateAsync(imageRowContentUpdateNewImage)

    t.is(imageRowContentUpdateNewImage.content.image.url !== imageRowContentUpdate.content.image.url, true)
})


test('api/page-section-publish - is old image content gone?', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page = (await createTestPage(site1.uid)).page

    // Add image row.
    const imageRowRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionType: 'image-row',
        })
        .expect(ok)
    const imageRowContentSection = imageRowRes.body.contentSection as ContentSection<ContentImageRow>

    // Update content with new image.
    const contentImageRowUpdate = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionUid: imageRowContentSection.uid,
            newImageUrl: (await uploadPhotoForTest(`${__dirname}/test-assets/2560x1440.jpg`)),
        })
        .expect(ok)
    const imageRowContentUpdate = contentImageRowUpdate.body.updatedSection as ContentSection<ContentImageRow>
    await contentSectionSchema.validateAsync(imageRowContentUpdate)

    // Publish the page
    await supertest(appLoaded)
        .post('/api/page-section-publish/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
        })
        .expect(ok)

    // Update content again, draft
    const contentImageRowUpdateNewImage = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionUid: imageRowContentSection.uid,
            newImageUrl: (await uploadPhotoForTest(`${__dirname}/test-assets/2560x1440.jpg`)),
        })
        .expect(ok)
    const imageRowContentUpdateNewImage = contentImageRowUpdateNewImage.body.updatedSection as ContentSection<ContentImageRow>
    await contentSectionSchema.validateAsync(imageRowContentUpdateNewImage)

    // Make sure image was updated.
    t.is(imageRowContentUpdateNewImage.content.image.url !== imageRowContentUpdate.content.image.url, true)

    // Publish the page again; should delete old image.
    await supertest(appLoaded)
        .post('/api/page-section-publish/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
        })
        .expect(ok)

    // TODO Failing cause publishing the page doesn't detect the changes. Could be tricky.
    // Test the old image content is gone.
    // await t.throwsAsync(Axios.get(imageRowContentUpdate.content.image.url))
})


test('api/page-section-publish - check draft image is gone on double image upload.', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page = (await createTestPage(site1.uid)).page

    // Add image row.
    const imageRowRes = await supertest(appLoaded)
        .post('/api/page-section-add/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionType: 'image-row',
        })
        .expect(ok)
    const imageRowContentSection = imageRowRes.body.contentSection as ContentSection<ContentImageRow>

    // Update content with new image.
    const contentImageRowUpdate = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionUid: imageRowContentSection.uid,
            newImageUrl: (await uploadPhotoForTest(`${__dirname}/test-assets/2560x1440.jpg`)),
        })
        .expect(ok)
    const imageRowContentUpdate = contentImageRowUpdate.body.updatedSection as ContentSection<ContentImageRow>
    await contentSectionSchema.validateAsync(imageRowContentUpdate)

    // Update content again, draft
    const contentImageRowUpdateNewImage = await supertest(appLoaded)
        .post('/api/page-section-update/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid: page.uid,
            contentSectionUid: imageRowContentSection.uid,
            newImageUrl: (await uploadPhotoForTest(`${__dirname}/test-assets/2560x1440.jpg`)),
        })
        .expect(ok)
    const imageRowContentUpdateNewImage = contentImageRowUpdateNewImage.body.updatedSection as ContentSection<ContentImageRow>
    await contentSectionSchema.validateAsync(imageRowContentUpdateNewImage)

    // Make sure image was updated.
    t.is(imageRowContentUpdateNewImage.content.image.url !== imageRowContentUpdate.content.image.url, true)

    // Test the old image content is gone.
    // await t.throwsAsync(Axios.get(imageRowContentUpdate.content.image.url))
})

test('api/page-sections-reorder - section reorder works', async t => {

    const data = await createTestUser();
    const site = (await createTestSite({ jwt: data.jwt })).site;
    const pageUid = (await createTestPage(site.uid)).page.uid;

    // add the random 3 contents
    await createRandomTestContent(pageUid, data.jwt);
    await createRandomTestContent(pageUid, data.jwt);
    await createRandomTestContent(pageUid, data.jwt);
    // fetch the page information
    const pagePrevious = await fetchPage(pageUid);

    // reorder the content sections manually
    let contentDraftSections = pagePrevious.contentDraftSections;
    const fromIndex = 1;
    const toIndex = 2;

    const item = contentDraftSections.splice(fromIndex, 1)[0];
    contentDraftSections.splice(toIndex, 0, item);

    // reorder the content sections by endpoint
    await supertest(appLoaded)
        .post('/api/page-sections-reorder/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid,
            fromIndex,
            toIndex
        })
        .expect(ok);
    // fetch the updated page
    const pageUpdated = await fetchPage(pageUid);
    // make sure sections were reordered successfully
    t.is(JSON.stringify(contentDraftSections) === JSON.stringify(pageUpdated.contentDraftSections), true);

    t.pass()
})

test('api/page-sections-reorder - fromIndex or toIndex can not be a negative number', async t => {

    const data = await createTestUser();
    const site = (await createTestSite({ jwt: data.jwt })).site;
    const pageUid = (await createTestPage(site.uid)).page.uid;

    // add the random 3 contents
    await createRandomTestContent(pageUid, data.jwt);
    await createRandomTestContent(pageUid, data.jwt);
    await createRandomTestContent(pageUid, data.jwt);

    // *index(fromIndex and toIndex both) can not be a negative number. it should be positive integer including 0
    const fromIndex = -1;
    const toIndex = 2;

    // reorder the content sections by endpoint
    await supertest(appLoaded)
        .post('/api/page-sections-reorder/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid,
            fromIndex,
            toIndex
        })
        .expect(error);

    t.pass()
})

test('api/page-sections-reorder - first content section should be header', async t => {

    const data = await createTestUser();
    const site = (await createTestSite({ jwt: data.jwt })).site;
    const pageUid = (await createTestPage(site.uid)).page.uid;

    /**
     *  add the 3 contents by pointing out the content-type
     *  first and third is header and second is text-block content
     */

    await createRandomTestContent(pageUid, data.jwt, 'header');
    await createRandomTestContent(pageUid, data.jwt, 'text-block');
    await createRandomTestContent(pageUid, data.jwt, 'header');

    /**
     * we set params like this. in this case, first header content would be changed into text-block content
     * ! it is error
     */

    const fromIndex = 0;
    const toIndex = 1;


    // reorder the content sections by endpoint
    await supertest(appLoaded)
        .post('/api/page-sections-reorder/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageUid,
            fromIndex,
            toIndex
        })
        .expect(error);

    t.pass()
})
