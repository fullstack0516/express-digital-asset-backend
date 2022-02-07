import { BlacklistedDataCategory, blacklistedDataCategorySchema } from './../models/blacklisted-data-category';
import { UserDataTag } from './../models/user-data-tag';
import { createJwt } from './../utils/helpers-auth';
import { fetchSiteViaUrl } from './../utils/helpers-sites';
import { classicCarsSiteUrl, coffeePageUrl, createTextBlock, healthAndFitnessSiteUrl } from './dummy-content.test';
import test from 'ava';
import { appLoaded, createTestUser, error, ok } from './index.test';
import * as supertest from 'supertest';
import { fetchPageViaUrl, fetchSitePages } from '../utils/helpers-pages';
import { fetchUser } from '../utils/helpers-users';
import { recordDataTagsForUser } from '../utils/helpers-data-tags'

export const coffeeCategory = 'Coffee & Tea'
export const landroverCategory = 'Autos & Vehicles';

test('data-tags & publish page tests', async t => {

    // Should be two pages for this site.
    const site = await fetchSiteViaUrl(healthAndFitnessSiteUrl)
    const pages = await fetchSitePages(site.uid, new Date().toISOString())
    t.is(pages.length == 1, true)

    // Fetch the page, should be data tags.
    const page = await fetchPageViaUrl(site.url, coffeePageUrl)
    t.is(Object.keys(page.dataTags).length > 0, true)

    // Is the page categories the same as the data tags?
    const oneDataTag = page.dataTags[Object.keys(page.dataTags)[0]];
    t.deepEqual(oneDataTag.contentCategories, page.contentCategories)

    const testUser = await createTestUser()
    const adminUser = await fetchUser(site.siteOwnersUids[0])
    const adminUserJwt = await createJwt(adminUser.uid)

    // Record a visit
    const result1 = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: page.uid,
        })
        .expect(ok)
    t.is(result1.body.result === 'createdNew', true)

    // Fetch the data, check that we have tags
    const myDataResults1 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myData = myDataResults1.body.myData as { [category: string]: UserDataTag[] }
    t.is(Object.keys(myData).length > 0, true)

    // Try to visit again.
    const result2 = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: page.uid,
        })
        .expect(ok)
    t.is(result2.body.result === 'updated', true)

    // Fetch the data, check that tags are the same.
    const myDataResultsRevisit = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myDataRevisit = myDataResultsRevisit.body.myData as { [category: string]: UserDataTag[] }
    t.is(Object.keys(myData).length == Object.keys(myDataRevisit).length, true)

    // Add a draft section, publish the page, and try again.
    await createTextBlock(page.uid, adminUserJwt, 'text-block', 'World of Warcraft (WoW) is a massively multiplayer online role-playing game (MMORPG) released in 2004 by Blizzard Entertainment. Set in the Warcraft fantasy universe, World of Warcraft takes place within the world of Azeroth, approximately four years after the events of the previous game in the series, Warcraft III: The Frozen Throne.[3] The game was announced in 2001, and was released for the 10th anniversary of the Warcraft franchise on November 23, 2004. Since launch, World of Warcraft has had eight major expansion packs: The Burning Crusade (2007), Wrath of the Lich King (2008), Cataclysm (2010), Mists of Pandaria (2012), Warlords of Draenor (2014), Legion (2016), Battle for Azeroth (2018), and Shadowlands (2020).')
    // Publish The page and get the tags.
    await supertest(appLoaded)
        .post('/api/page-section-publish')
        .set({
            authorization: adminUserJwt,
        })
        .send({
            pageUid: page.uid,
        })

    const result3 = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: page.uid,
        })
        .expect(ok)
    t.is(result3.body.result === 'pageChanged', true)

    // Fetch the data again; check that it's bigger.
    const myDataResults2 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myData2 = myDataResults2.body.myData as { [category: string]: UserDataTag[] }
    t.is(Object.keys(myData2).length > Object.keys(myData).length, true)


    t.pass()
});


test('data-tags & test my data - category', async t => {

    // Should be two pages for this site.
    const site = await fetchSiteViaUrl(classicCarsSiteUrl)
    const pages = await fetchSitePages(site.uid, new Date().toISOString())
    t.is(pages.length == 2, true)

    const testUser = await createTestUser()

    // Record a visit on both pages
    const result1 = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: pages[0].uid,
        })
        .expect(ok)
    t.is(result1.body.result === 'createdNew', true)
    const result2 = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: pages[1].uid,
        })
        .expect(ok)
    t.is(result2.body.result === 'createdNew', true)

    // Fetch the data, check that we have tags
    const myDataResults1 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myData = myDataResults1.body.myData as { [category: string]: UserDataTag[] }
    t.is(Object.keys(myData).length > 0, true)

    // Fetch the data, check 
    const myDataResults2 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
            category: Object.keys(myData)[0]
        })
        .expect(ok)
    const myData2 = myDataResults2.body.myData as { [category: string]: UserDataTag[] }
    t.is(Object.keys(myData2).length > 0, true)

})


test('data-tags & test my data - pagination', async t => {

    // Should be two pages for this site.
    const site = await fetchSiteViaUrl(classicCarsSiteUrl)
    const pages = await fetchSitePages(site.uid, new Date().toISOString())
    t.is(pages.length == 2, true)

    const testUser = await createTestUser()

    // Record a visit on both pages
    const result1 = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: pages[0].uid,
        })
        .expect(ok)
    t.is(result1.body.result === 'createdNew', true)
    const result2 = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: pages[1].uid,
        })
        .expect(ok)
    t.is(result2.body.result === 'createdNew', true)

    // Fetch the data, check that we have tags
    const myDataResults1 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myData = myDataResults1.body.myData as { [category: string]: UserDataTag[] }
    t.is(Object.keys(myData).length > 0, true)

    // // Fetch the data, check 
    const myDataResults2 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date(0).toISOString(),
        })
        .expect(ok)
    const myData2 = myDataResults2.body.myData as { [category: string]: UserDataTag[] }
    t.is(Object.keys(myData2).length == 0, true)

})


test('api/set-category-blacklisted - blacklist a category', async t => {

    // Should be two pages for this site.
    const siteCars = await fetchSiteViaUrl(classicCarsSiteUrl)
    const pagesCars = await fetchSitePages(siteCars.uid, new Date().toISOString())
    t.is(pagesCars.length == 2, true)

    const siteCoffee = await fetchSiteViaUrl(healthAndFitnessSiteUrl)
    const pagesCoffee = await fetchSitePages(siteCoffee.uid, new Date().toISOString())
    t.is(pagesCoffee.length == 1, true)

    const testUser = await createTestUser()

    // Record a visit on both pages
    await recordDataTagsForUser(pagesCars[0].uid, testUser.user.uid)
    await recordDataTagsForUser(pagesCars[1].uid, testUser.user.uid)
    await recordDataTagsForUser(pagesCoffee[0].uid, testUser.user.uid)

    // Set the category blacklisted.
    await supertest(appLoaded)
        .post('/api/set-category-blacklisted/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            categoryName: coffeeCategory,
        })
        .expect(ok)

    // Fetch the data, check 
    const myDataResults2 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myData2 = myDataResults2.body.myData as { [category: string]: UserDataTag[] }

    // Check that this category doesn't exist.
    let coffeeCategoryExists = false;
    let landroverCategoryExists = false;
    Object.entries(myData2).forEach((entry) => {
        const [key, dateTags] = entry;
        dateTags.forEach((tag) => {
            tag.contentCategories.forEach((eachTagCategory) => {
                if (eachTagCategory === coffeeCategory) {
                    coffeeCategoryExists = true;
                }
                if (eachTagCategory === landroverCategory) {
                    landroverCategoryExists = true;
                }
            })
        })
    })
    t.is(coffeeCategoryExists, false)
    t.is(landroverCategoryExists, true)

    // Try to record the same category again.
    await recordDataTagsForUser(pagesCoffee[0].uid, testUser.user.uid)

    // Fetch the data, check again.
    const myDataResults3 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myData3 = myDataResults3.body.myData as { [category: string]: UserDataTag[] }

    // Check that this category doesn't exist.
    let coffeeCategoryExistsAgain = false;
    let landroverCategoryExistsAgain = false;
    Object.entries(myData3).forEach((entry) => {
        const [key, dateTags] = entry;
        dateTags.forEach((tag) => {
            tag.contentCategories.forEach((eachTagCategory) => {
                if (eachTagCategory === coffeeCategory) {
                    coffeeCategoryExistsAgain = true;
                }
                if (eachTagCategory === landroverCategory) {
                    landroverCategoryExistsAgain = true;
                }
            })
        })
    })
    t.is(coffeeCategoryExistsAgain, false)
    t.is(landroverCategoryExistsAgain, true)

    // Unblack list and try again.
    await supertest(appLoaded)
        .post('/api/set-category-unblacklisted/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            categoryName: coffeeCategory,
        })
        .expect(ok)

    // Record the visit.
    await recordDataTagsForUser(pagesCoffee[0].uid, testUser.user.uid)

    // Fetch the data, check again.
    const myDataResults4 = await supertest(appLoaded)
        .post('/api/fetch-my-data/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            fromIso: new Date().toISOString(),
        })
        .expect(ok)
    const myData4 = myDataResults4.body.myData as { [category: string]: UserDataTag[] }

    // Should be tags now.
    let coffeeCategoryExists3 = false;
    let landroverCategoryExists3 = false;
    Object.entries(myData4).forEach((entry) => {
        const [key, dateTags] = entry;
        dateTags.forEach((tag) => {
            tag.contentCategories.forEach((eachTagCategory) => {
                if (eachTagCategory === coffeeCategory) {
                    coffeeCategoryExists3 = true;
                }
                if (eachTagCategory === landroverCategory) {
                    landroverCategoryExists3 = true;
                }
            })
        })
    })
    t.is(coffeeCategoryExists3, true)
    t.is(landroverCategoryExists3, true)
})


test('get-blacklisted-categories - Get the list of blacklisted categories', async t => {

    const coffeeCategory = 'Coffee & Tea'

    const siteCoffee = await fetchSiteViaUrl(healthAndFitnessSiteUrl)
    const pagesCoffee = await fetchSitePages(siteCoffee.uid, new Date().toISOString())
    t.is(pagesCoffee.length == 1, true)

    const testUser = await createTestUser()

    await supertest(appLoaded)
        .post('/api/set-category-blacklisted/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            categoryName: coffeeCategory,
        })
        .expect(ok)

    const res = await supertest(appLoaded)
        .post('/api/get-blacklisted-categories/')
        .set({
            authorization: testUser.jwt,
        })
        .expect(ok)

    const blacklistedCategories = res.body.blacklistedCategories as BlacklistedDataCategory[]

    t.is(blacklistedCategories.filter((t) => t.category === coffeeCategory).length === 1, true)
})

test('data-tags & fetch the count of data points', async t => {

    // Should be two pages for this site.
    const site = await fetchSiteViaUrl(classicCarsSiteUrl)
    const pages = await fetchSitePages(site.uid, new Date().toISOString())
    t.is(pages.length == 2, true)

    const testUser = await createTestUser()

    // fetch the count of data points and check it is empty
    const firstAccessDataPointsResult = await supertest(appLoaded)
        .post('/api/fetch-data-points-count/')
        .set({
            authorization: testUser.jwt,
        })
        .expect(ok)

    t.is(firstAccessDataPointsResult.body.count === 0, true)

    // Record a visit on first page
    const firstVisitResult = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: pages[0].uid,
        })
        .expect(ok)
    t.is(firstVisitResult.body.result === 'createdNew', true)

    // fetch the count of data points again and check it was increased
    const secondAccessDataPointsResult = await supertest(appLoaded)
        .post('/api/fetch-data-points-count/')
        .set({
            authorization: testUser.jwt,
        })
        .expect(ok)

    t.is(secondAccessDataPointsResult.body.count > 0, true)

    // revisit on first page
    const secondVisitResult = await supertest(appLoaded)
        .post('/api/record-page-tags/')
        .set({
            authorization: testUser.jwt,
        })
        .send({
            pageUid: pages[0].uid,
        })
        .expect(ok)
    t.is(secondVisitResult.body.result === 'updated', true)

    // fetch the count of data points again and check there was not a changes
    const thirdAccessDataPointsResult = await supertest(appLoaded)
        .post('/api/fetch-data-points-count/')
        .set({
            authorization: testUser.jwt,
        })
        .expect(ok)

    t.is(thirdAccessDataPointsResult.body.count === secondAccessDataPointsResult.body.count, true)
})