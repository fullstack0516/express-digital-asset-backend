import test from 'ava';
import * as supertest from 'supertest'
import { appLoaded, createTestUser, error, ok } from './index.test';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import Page, { pageSchema } from '../models/page';
import { createTestSite } from './sites.test';
import { createUid } from '../utils/helpers';
import { updateUser } from '../utils/helpers-users';


const createPageName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 1,
        style: 'capital',
    });
}

export const createPageUrl = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
        style: 'lowerCase',
    });
}

export const createTestPage = async (siteUid: string, props?: { jwt?: string, overrideData?: any }): Promise<{ jwt: string, page: Page }> => {

    let jwt;

    if (props?.jwt) {
        jwt = props.jwt;
    } else {
        const data = await createTestUser();
        jwt = data.jwt
    }

    const sendData = {
        ...{
            title: createPageName(),
            // Lower case and hypthens only.
            url: createPageUrl(),
            siteUid,
        },
        ...props?.overrideData ?? {},
    }

    const res = await supertest(appLoaded)
        .post('/api/create-page/')
        .set({
            authorization: jwt,
        })
        .send(sendData)
        .expect(ok)

    const page = res.body.page as Page
    await pageSchema.validateAsync(page)

    return {
        jwt,
        page,
    }
}

test('api/create-page - create basic page', async t => {
    const site = await createTestSite();
    await createTestPage(site.site.uid)
    t.pass()
})

test('api/create-page - not unique url', async t => {
    const site = await createTestSite();

    const testUrl = createPageUrl()

    await createTestPage(site.site.uid, { overrideData: { url: testUrl } })

    try {
        await createTestPage(site.site.uid, { overrideData: { url: testUrl } })
    } catch (e) {
        t.pass()
        return
    }

    t.fail()
})

test('api/check-page-url-unqiue', async t => {

    // Is not unique
    const site = await createTestSite();
    const testUrl = createPageUrl()
    const page = (await createTestPage(site.site.uid, { overrideData: { url: testUrl } })).page
    const res = await supertest(appLoaded)
        .post('/api/check-page-url-unqiue/')
        .send({
            url: page.url,
        })
        .expect(ok)
    t.is(res.body.isUnique, false)

    // Is unique
    const res2 = await supertest(appLoaded)
        .post('/api/check-page-url-unqiue/')
        .send({
            url: page.url + createUid(),
        })
        .expect(ok)
    t.is(res2.body.isUnique, true)
})

test('api/fetch-page-via-url', async t => {

    // Got page
    const site = await createTestSite();
    const testUrl = createPageUrl()
    const page = (await createTestPage(site.site.uid, { jwt: site.jwt, overrideData: { url: testUrl } })).page
    const res = await supertest(appLoaded)
        .post('/api/fetch-page-via-url/')
        .set({
            authorization: site.jwt,
        })
        .send({
            url: site.site.url + '/' + page.url,
        })
        .expect(ok)
    const gotPage = res.body.page as Page
    t.is(gotPage.title === page.title, true)
})

test('api/fetch-page-via-url - no page url', async t => {
    const site = await createTestSite();
    const testUrl = createPageUrl()
    await createTestPage(site.site.uid, { jwt: site.jwt, overrideData: { url: testUrl } })
    await supertest(appLoaded)
        .post('/api/fetch-page-via-url/')
        .set({
            authorization: site.jwt,
        })
        .send({
            pageUrl: site.site.url + '/' + testUrl + createUid(),
        })
        .expect(error)
    t.pass()
})


test('api/update-page - update the page', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page = (await createTestPage(site1.uid)).page

    const newTitle = 'Test Title';
    const newColor = '#ff7534'

    const res = await supertest(appLoaded)
        .post('/api/update-page/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageToUpdateUid: page.uid,
            title: newTitle,
            pageColor: newColor
        })
        .expect(ok)

    const updatePage = res.body.page as Page

    t.is(updatePage.uid === page.uid, true)
    t.is(updatePage.title === newTitle, true)

    t.pass()
})


test('api/delete-page - delete page', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page

    // Delete the page.
    await supertest(appLoaded)
        .post('/api/delete-page/')
        .set({
            authorization: data.jwt,
        })
        .send({
            pageToDeleteUid: page1.uid,
        })
        .expect(ok)

    // Test that there's no page
    await supertest(appLoaded)
        .post('/api/fetch-page-via-url/').set({
            authorization: data.jwt,
        })
        .send({
            url: site1.url + '/' + page1.url,
        })
        .expect(error)
    t.pass()
})


test('api/create-page - User is flagged', async t => {
    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    await updateUser(data.user.uid, { isFlagged: true })
    await t.throwsAsync(createTestPage(site1.uid, { jwt: data.jwt, overrideData: {} }))
})


test('api/fetch-site-pages-recent-updates - Fetch recent sites', async t => {
    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site

    await Promise.all(new Array(10).fill(0).map(o => {
        return createTestPage(site1.uid, { jwt: data.jwt });
    }))

    const res = await supertest(appLoaded)
        .post('/api/fetch-site-pages-recent-updates/')
        .send({
            siteUid: site1.uid,
            fromIso: new Date().toISOString(),
        })
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].lastUpdateIso >= pages[1].lastUpdateIso, true)
    t.is(pages[1].lastUpdateIso >= pages[2].lastUpdateIso, true)
    t.is(pages[2].lastUpdateIso >= pages[3].lastUpdateIso, true)
})
