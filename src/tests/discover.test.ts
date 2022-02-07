import { landroverCategory, coffeeCategory } from './data-tag.test';
import { createTestSite } from './sites.test';
import { subscribeUserToSite } from './../utils/helpers-sites';
import test from 'ava';
import * as supertest from 'supertest'
import { appLoaded, createTestUser, ok } from './index.test';
import { recordVisit, updatePage } from '../utils/helpers-pages';
import Page from '../models/page';
import Site from '../models/site';
import { asyncForEach } from '../utils/helpers';
import { createTestPage } from './pages.test';


test('api/discover-fetch-popular-pages  - fetch popular pages.', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site

    const page1 = (await createTestPage(site1.uid)).page
    await updatePage(page1.uid, { totalVisits: Math.ceil(Math.random() * 1000) })
    const page2 = (await createTestPage(site1.uid)).page
    await updatePage(page2.uid, { totalVisits: Math.ceil(Math.random() * 1000) })
    const page3 = (await createTestPage(site1.uid)).page
    await updatePage(page3.uid, { totalVisits: Math.ceil(Math.random() * 1000) })

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-popular-pages/')
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].totalVisits >= pages[1].totalVisits, true)
    t.is(pages[1].totalVisits >= pages[2].totalVisits, true)
})


test('api/discover-fetch-popular-sites  - fetch popular sites.', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site
    const page1 = (await createTestPage(site1.uid)).page
    await asyncForEach(new Array(30).fill(0), async () => {
        await recordVisit(page1.uid)
    })

    const site2 = (await createTestSite({ jwt: data.jwt })).site
    const page2 = (await createTestPage(site2.uid)).page
    await asyncForEach(new Array(15).fill(0), async () => {
        await recordVisit(page2.uid)
    })

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-popular-sites/')
        .expect(ok)

    const sites = res.body.sites as Site[]

    t.is(sites[0].totalVisits >= sites[1].totalVisits, true)
    t.is(sites[1].totalVisits >= sites[2].totalVisits, true)
})

test('api/discover-fetch-new-pages - fetch new pages.', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site

    const page1 = (await createTestPage(site1.uid)).page
    await new Promise(r => setTimeout(r, 1200));
    const page2 = (await createTestPage(site1.uid)).page
    await new Promise(r => setTimeout(r, 1200));
    const page3 = (await createTestPage(site1.uid)).page

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-new-pages/')
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].createdIso >= pages[1].createdIso, true)
    t.is(pages[1].createdIso >= pages[2].createdIso, true)
})


test('api/discover-fetch-trending-pages - fetch trending pages.', async t => {

    const data = await createTestUser()
    const site1 = (await createTestSite({ jwt: data.jwt })).site

    const page1 = (await createTestPage(site1.uid)).page
    await updatePage(page1.uid, { totalVisits: Math.ceil(Math.random() * 1000) })
    await new Promise(r => setTimeout(r, 1200));
    const page2 = (await createTestPage(site1.uid)).page
    await updatePage(page2.uid, { totalVisits: Math.ceil(Math.random() * 1000) })
    await new Promise(r => setTimeout(r, 1200));
    const page3 = (await createTestPage(site1.uid)).page
    await updatePage(page3.uid, { totalVisits: Math.ceil(Math.random() * 1000) })

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-trending-pages/')
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].totalVisits >= pages[1].totalVisits, true)
    t.is(pages[1].totalVisits >= pages[2].totalVisits, true)
})


test('api/discover-fetch-subscribed-new-pages - fetch subscribed sites new pages.', async t => {

    const data = await createTestUser()
    const site1 = await createTestSite()
    await subscribeUserToSite(data.user.uid, site1.site.uid)

    const siteNotSubscribed = await createTestSite()
    const pageNotSubscribed = await createTestPage(siteNotSubscribed.site.uid)

    const page = await createTestPage(site1.site.uid)
    const page2 = await createTestPage(site1.site.uid)

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-subscribed-new-pages/')
        .set({
            authorization: data.jwt,
        })
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages.filter((p) => p.uid === page.page.uid).length == 1, true)
    t.is(pages.filter((p) => p.uid === page2.page.uid).length == 1, true)
    t.is(pages.filter((p) => p.uid === pageNotSubscribed.page.uid).length == 0, true)
})



test('api/discover-fetch-popular-pages  - fetch popular pages - by category', async t => {

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-popular-pages/')
        .send({
            category: landroverCategory,
        })
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].contentCategories.filter((t) => t === landroverCategory).length > 0, true)
    t.is(pages[0].contentCategories.filter((t) => t === coffeeCategory).length === 0, true)
})


test('api/discover-fetch-new-pages - fetch new pages - by category', async t => {

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-new-pages/')
        .send({
            category: landroverCategory,
        })
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].contentCategories.filter((t) => t === landroverCategory).length > 0, true)
    t.is(pages[0].contentCategories.filter((t) => t === coffeeCategory).length === 0, true)
})


test('api/discover-fetch-trending-pages - fetch trending pages - by category', async t => {

    const res = await supertest(appLoaded)
        .post('/api/discover-fetch-trending-pages/')
        .send({
            category: landroverCategory,
        })
        .expect(ok)

    const pages = res.body.pages as Page[]

    t.is(pages[0].contentCategories.filter((t) => t === landroverCategory).length > 0, true)
    t.is(pages[0].contentCategories.filter((t) => t === coffeeCategory).length === 0, true)
})
