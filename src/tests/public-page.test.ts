import test from 'ava';
import * as supertest from 'supertest'
import { appLoaded, ok, error } from './index.test';
import { createTestSite } from './sites.test';
import { createTestPage, createPageUrl } from './pages.test';
import { fetchSite } from '../utils/helpers-sites';
import { fetchNewPages, fetchPage, fetchPopularPages, updatePage, fetchTrendingPages } from '../utils/helpers-pages';
import { fetchUser } from '../utils/helpers-users';
import Page from '../models/page';
import Site from '../models/site';


test('api/subscribe-to-site - test sub', async t => {
    const site = await createTestSite();
    await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    await supertest(appLoaded)
        .post('/api/subscribe-to-site/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid,
        })
        .expect(ok)

    t.pass()
})

test('api/unsubscribe-to-site - unsubscribe sub', async t => {
    const site = await createTestSite();
    await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    await supertest(appLoaded)
        .post('/api/subscribe-to-site/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid,
        })
        .expect(ok)

    await supertest(appLoaded)
        .post('/api/unsubscribe-to-site/')
        .set({
            authorization: site.jwt,
        })
        .send({
            siteUid: site.site.uid,
        })
        .expect(ok)

    t.pass()
})


test('api/record-page-impression - Record page impression', async t => {
    const site = await createTestSite();
    const page = await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    // Spam the record impressions.
    const impressions = new Array(45).fill(0).map(() => {
        return supertest(appLoaded)
            .post('/api/record-page-impression/')
            .set({
                authorization: site.jwt,
            })
            .send({
                pageUid: page.page.uid,
            })
            .expect(ok)
    })

    await Promise.all(impressions)

    const updateSite = await fetchSite(site.site.uid)
    const updatedPage = await fetchPage(page.page.uid)
    const updatedUser = await fetchUser(site.site.siteOwnersUids[0])

    t.is(updateSite.totalImpressions === impressions.length, true)
    t.is(updatedPage.totalImpressions === impressions.length, true)
    t.is(updatedUser.totalImpressionsOnSites === impressions.length, true)
})

test('api/record-page-visit - Record page visit', async t => {
    const site = await createTestSite();
    const page = await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    // Spam the record visits.
    const visits = new Array(120).fill(0).map(() => {
        return supertest(appLoaded)
            .post('/api/record-page-visit/')
            .set({
                authorization: site.jwt,
            })
            .send({
                pageUid: page.page.uid,
            })
            .expect(ok)
    })

    await Promise.all(visits)

    const updateSite = await fetchSite(site.site.uid)
    const updatedPage = await fetchPage(page.page.uid)
    const updatedUser = await fetchUser(site.site.siteOwnersUids[0])

    t.is(updateSite.totalVisits === visits.length, true)
    t.is(updatedPage.totalVisits === visits.length, true)
    t.is(updatedUser.totalVisitsOnSites === visits.length, true)
})



test('api/report-page - Report normally', async t => {
    const site = await createTestSite();
    const page = await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    // Spam the record visits.
    const reports = new Array(3).fill(0).map(() => {
        return supertest(appLoaded)
            .post('/api/report-page/')
            .set({
                authorization: site.jwt,
            })
            .send({
                pageUid: page.page.uid,
                reasonDesc: 'Report text random - Reported by test.'
            })
            .expect(ok)
    })

    await Promise.all(reports)

    const updatedPage = await fetchPage(page.page.uid)

    t.is(updatedPage.numberOfReports === reports.length, true)
    t.is(updatedPage.isFlagged, false)
})


test('api/report-page - Auto-flag user and page', async t => {
    const site = await createTestSite();
    const page = await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })


    // Spam the record visits.
    const visits = new Array(100).fill(0).map(() => {
        return supertest(appLoaded)
            .post('/api/record-page-visit/')
            .set({
                authorization: site.jwt,
            })
            .send({
                pageUid: page.page.uid,
            })
            .expect(ok)
    })

    // Fake the total number of reports
    await updatePage(page.page.uid, { numberOfReports: 20 })
    await Promise.all(visits)

    // Report that should auto flag.
    await supertest(appLoaded)
        .post('/api/report-page/')
        .set({
            authorization: site.jwt,
        })
        .send({
            pageUid: page.page.uid,
            reasonDesc: 'Report text random - Reported by test.'
        })
        .expect(ok)

    const updatedPage = await fetchPage(page.page.uid)
    const updatedUser = await fetchUser(site.site.siteOwnersUids[0])

    t.is(updatedPage.isFlagged, true)
    t.is(updatedUser.isFlagged, true)
})


test('api/report-page - User cannot report twice.', async t => {
    const site = await createTestSite();
    const page = await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    await supertest(appLoaded)
        .post('/api/report-page/')
        .set({
            authorization: site.jwt,
        })
        .send({
            pageUid: page.page.uid,
            reasonDesc: 'Report text random - Reported by test.'
        })
        .expect(ok)

    await supertest(appLoaded)
        .post('/api/report-page/')
        .set({
            authorization: site.jwt,
        })
        .send({
            pageUid: page.page.uid,
            reasonDesc: 'Report text random - Reported by test.'
        })
        .expect(error)

    t.pass()
})


test('Get popular pages for site', async t => {
    const site = await createTestSite();

    let page1 = await (await createTestPage(site.site.uid)).page
    let page2 = await (await createTestPage(site.site.uid)).page
    let page3 = await (await createTestPage(site.site.uid)).page

    page1 = await updatePage(page1.uid, { totalVisits: 100 })
    page2 = await updatePage(page2.uid, { totalVisits: 50 })
    page3 = await updatePage(page3.uid, { totalVisits: 25 })

    const popularPages = await fetchPopularPages(page1.siteUid)

    t.is(popularPages[0].uid === page1.uid, true)
    t.is(popularPages[1].uid === page2.uid, true)
    t.is(popularPages[2].uid === page3.uid, true)
})


test('Get new pages for site', async t => {
    const site = await createTestSite();

    let page1 = await (await createTestPage(site.site.uid)).page
    await (await createTestPage(site.site.uid)).page
    await (await createTestPage(site.site.uid)).page

    // Old page
    const daysNAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    page1 = await updatePage(page1.uid, { createdIso: daysNAgo })

    const popularPages = await fetchNewPages(page1.siteUid)

    t.is(popularPages.length === 2, true)
})


test('Get new trending pages for site', async t => {
    const site = await createTestSite();

    let page1 = await (await createTestPage(site.site.uid)).page
    let page2 = await (await createTestPage(site.site.uid)).page
    let page3 = await (await createTestPage(site.site.uid)).page

    // Old page, was trending
    const daysNAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    page1 = await updatePage(page1.uid, { totalVisits: 100, createdIso: daysNAgo })

    // New popular page.
    page2 = await updatePage(page2.uid, { totalVisits: 50 })

    // Second trending page.
    page3 = await updatePage(page3.uid, { totalVisits: 25 })

    const trending = await fetchTrendingPages(page1.siteUid)

    t.is(trending.length === 2, true)
    t.is(trending[0].uid === page2.uid, true)
    t.is(trending[1].uid === page3.uid, true)
})


test('api/fetch-page-via-url-public - fetch the public page via the url', async t => {
    const site = await createTestSite();

    // Make some dummy pages
    let page1 = await (await createTestPage(site.site.uid)).page
    let page2 = await (await createTestPage(site.site.uid)).page
    let page3 = await (await createTestPage(site.site.uid)).page
    // Old page, was trending
    const daysNAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    page1 = await updatePage(page1.uid, { totalVisits: 100, createdIso: daysNAgo })
    // New popular page.
    page2 = await updatePage(page2.uid, { totalVisits: 50 })
    // Second trending page.
    page3 = await updatePage(page3.uid, { totalVisits: 25 })

    const res = await supertest(appLoaded)
        .post('/api/fetch-page-via-url-public/')
        .send({
            url: site.site.url + '/' + page1.url,
        })
        .expect(ok)

    const results = res.body as {
        page: Page,
        newPagesFromSite: Page[],
        trendingPageFromSite: Page[],
        popularPagesFromSite: Page[]
    }

    t.is(results.page.url === page1.url, true)
    t.is(results.page.uid === page1.uid, true)

    t.is(results.newPagesFromSite.length > 0, true)
    t.is(results.trendingPageFromSite.length > 0, true)
    t.is(results.popularPagesFromSite.length > 0, true)
})

test('api/fetch-more-new-pages - fetch more new pages', async t => {
    const site = await createTestSite();

    // Make some dummy pages
    let page1 = await (await createTestPage(site.site.uid)).page
    let page2 = await (await createTestPage(site.site.uid)).page
    let page3 = await (await createTestPage(site.site.uid)).page

    // Old page 1
    page1 = await updatePage(page1.uid, { createdIso: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() })
    // Old page 2
    page2 = await updatePage(page2.uid, { createdIso: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() })
    // Old page 3
    page3 = await updatePage(page3.uid, { createdIso: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() })

    // page
    const fromIso = new Date(Date.now() - 11.5 * 24 * 60 * 60 * 1000).toISOString()

    const res = await supertest(appLoaded)
        .post('/api/fetch-more-new-pages/')
        .send({
            siteUid: site.site.uid,
            fromIso: fromIso
        })
        .expect(ok)

    const results = res.body as {
        newPagesFromSite: Page[],
    }

    t.is(results.newPagesFromSite.length === 1, true)
    t.pass()
})

test('api/fetch-more-trending-pages - fetch more trending pages', async t => {
    const site = await createTestSite();

    // Make some dummy pages
    let page1 = await (await createTestPage(site.site.uid)).page
    let page2 = await (await createTestPage(site.site.uid)).page
    let page3 = await (await createTestPage(site.site.uid)).page

    // Old page, was trending
    const daysNAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    page1 = await updatePage(page1.uid, { totalVisits: 100, createdIso: daysNAgo })
    // New trending page.
    page2 = await updatePage(page2.uid, { totalVisits: 50 })
    // Second trending page.
    page3 = await updatePage(page3.uid, { totalVisits: 25 })

    const res = await supertest(appLoaded)
        .post('/api/fetch-more-trending-pages/')
        .send({
            siteUid: site.site.uid,
            totalVisits: 26
        })
        .expect(ok)

    const results = res.body as {
        trendingPageFromSite: Page[],
    }

    t.is(results.trendingPageFromSite.length === 1, true)
    t.pass()
})

test('api/fetch-more-popular-pages - fetch more popular pages', async t => {
    const site = await createTestSite();

    // Make some dummy pages
    let page1 = await (await createTestPage(site.site.uid)).page
    let page2 = await (await createTestPage(site.site.uid)).page
    let page3 = await (await createTestPage(site.site.uid)).page

    // Old page, was popular
    const daysNAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    page1 = await updatePage(page1.uid, { totalVisits: 100, createdIso: daysNAgo })
    // New popular page.
    page2 = await updatePage(page2.uid, { totalVisits: 50 })
    // Second popular page.
    page3 = await updatePage(page3.uid, { totalVisits: 25 })

    const res = await supertest(appLoaded)
        .post('/api/fetch-more-popular-pages/')
        .send({
            siteUid: site.site.uid,
            totalVisits: 26
        })
        .expect(ok)

    const results = res.body as {
        popularPagesFromSite: Page[],
    }

    t.is(results.popularPagesFromSite.length === 1, true)
    t.pass()
})

test('api/fetch-site-via-url-public - fetch the public site via the url', async t => {
    const site = await createTestSite();

    // Make some dummy pages
    let page1 = await (await createTestPage(site.site.uid)).page
    let page2 = await (await createTestPage(site.site.uid)).page
    let page3 = await (await createTestPage(site.site.uid)).page
    // Old page, was trending
    const daysNAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
    page1 = await updatePage(page1.uid, { totalVisits: 100, createdIso: daysNAgo })
    // New popular page.
    page2 = await updatePage(page2.uid, { totalVisits: 50 })
    // Second trending page.
    page3 = await updatePage(page3.uid, { totalVisits: 25 })

    const res = await supertest(appLoaded)
        .post('/api/fetch-site-via-url-public/')
        .send({
            siteUrl: site.site.url,
        })
        .expect(ok)

    const results = res.body as {
        site: Site,
        newPagesFromSite: Page[],
        trendingPageFromSite: Page[],
        popularPagesFromSite: Page[]
    }

    t.is(results.site.url === site.site.url, true)
    t.is(results.site.uid === site.site.uid, true)

    t.is(results.newPagesFromSite.length > 0, true)
    t.is(results.trendingPageFromSite.length > 0, true)
    t.is(results.popularPagesFromSite.length > 0, true)
})

test('api/record-page-like - Record like normally', async t => {
    const site = await createTestSite();
    const page = await createTestPage(site.site.uid, { overrideData: { url: createPageUrl() } })

    const likeTypes = [-1, 0, 1];
    const liked = likeTypes[Math.floor(Math.random() * likeTypes.length)];

    await supertest(appLoaded)
        .post('/api/record-page-like/')
        .set({
            authorization: site.jwt,
        })
        .send({
            pageUid: page.page.uid,
            liked: liked
        })
        .expect(ok)

    const updatedPage = await fetchPage(page.page.uid)

    t.is(updatedPage.likes === liked, true)
    t.pass()
})