import { getBlacklistedCategories } from './get-blacklisted-categories';
import { setCategoryUnblacklisted } from './set-category-unblacklisted';
import { setCategoryBlacklisted } from './set-category-blacklisted';
import { fetchMyData } from './fetch-my-data';
import { recordPageTags } from './record-page-tags';
import { fetchSitePagesRecentUpdates } from './fetch-site-pages-recent-updates';
import { discoverFetchSubscribedNewPages } from './discover-fetch-subscribed-new-pages';
import { fetchSubscribedSites } from './fetch-subscribed-sites';
import { checkSubscribedSite } from './check-site-subscribed';
import { discoverFetchTrendingPages } from './discover-fetch-trending-pages';
import { discoverFetchHomePages } from './discover-fetch-home-pages';
import { discoverFetchNewPages } from './discover-fetch-new-pages';
import { discoverFetchPopularPages } from './discover-fetch-popular-pages';
import { discoverFetchPopularSites } from './discover-fetch-popular-sites';
import { adminFetchFlaggedPages } from './admin-fetch-flagged-pages';
import { adminFetchUsersCount } from './admin-fetch-users-count';
import { adminFetchUsers } from './admin-fetch-users';
import { adminFetchSites } from './admin-fetch-sites';
import { adminFetchNewPages } from './admin-fetch-new-pages';
import { adminFetchDataPointsCount } from './admin-fetch-data-points-count';
import { adminFetchNewSitesCount } from './admin-fetch-new-sites-count';
import { adminFetchNewUsersCount } from './admin-fetch-new-users-count';
import { adminFetchNewUsers } from './admin-fetch-new-users';
import { adminUpdatePage } from './admin-update-page';
import { isAdmin } from './../middleware/is-admin-middleware';
import { fetchSiteViaUrlPublic } from './fetch-site-via-url-public';
import { fetchPageViaUrlPublic } from './fetch-page-via-url-public';
import { reportPage } from './report-page';
import { recordPageVisit } from './record-page-visit';
import { recordPageLike } from './record-page-like';
import { recordPageImpression } from './record-page-impression';
import { unsubscribeToSite } from './unsubscribe-to-site';
import { subscribeToSite } from './subscribe-to-site';
import { pageSectionPublish } from './page-section-publish';
import { pageSectionsReorder } from './page-sections-reorder';
import PromiseRouter from 'express-promise-router';
const router = PromiseRouter();
import { errorHandler } from '../utils/error-handler';
import { minimumVersion } from './minimum-version';
import { isProduction } from '../utils/config';
import { uploadMiddleware } from '../middleware/upload-middleware'
import { rateLimiter10R1M } from '../middleware/rate-limiter'
import { setupIndexes } from './setup-indexs'
import { updateSchema } from './update-schema'
import { deleteSelf } from './delete-self'
import { searchLocation } from './search-location'
import { sendSMSCode } from './send-sms-code'
import { confirmSMSCode } from './confirm-sms-code'
import { fetchMySites } from './fetch-my-sites'
import { resetDB } from './dev-routes'
import { createSite } from './create-site'
import { updateSite } from './update-site'
import { deleteSite } from './delete-site'
import { createPage } from './create-page'
import { checkPageUrlUnique } from './check-page-url-unique'
import { checkSiteUrlUnique } from './check-site-url-unique'
import { fetchPageViaUrl } from './fetch-page-via-url'
import { fetchSiteViaUrl } from './fetch-site-via-url'
import { updatePage } from './update-page'
import { deletePage } from './delete-page'
import { pageSectionUpdate } from './page-section-update';
import { pageSectionDelete } from './page-section-delete';
import { pageSectionAdd } from './page-section-add';
import { checkIfAuthenticated } from '../middleware/auth-middleware';
import { fetchUser } from './fetch-user';
import { uploadPhoto } from './upload-photo';
import { logger } from '../utils/logger';
import { updateUser } from './update-user';
import { fetchUserLight } from './fetch-user-light';
import { confirmBackupEmail } from './confirm-backup-email';
import { confirmChangeSMS } from './confirm-change-sms';
import { fetchMoreTrendingPages } from './fetch-more-trending-pages'
import { fetchMoreNewPages } from './fetch-more-new-pages'
import { fetchMorePopularPages } from './fetch-more-popular-pages'
import { checkValidToken } from './check-valid-token'
import { fetchDataPointsCount } from './fetch-data-points-count';
import { fetchSite } from './fetch-site'
import { fetchWebsiteStatus } from './fetch-website-status';

// Log the routes.
router.use((req, res, next) => {
    logger.info(req.originalUrl);
    next();
});

// Used for the auto-dev finder.
router.get('/', (req, res) => { res.json({ status: 'ok' }) })

// Generic routes
router.post('/minimum-version', minimumVersion)
router.post('/upload-photo', rateLimiter10R1M, uploadMiddleware.single('photo'), uploadPhoto);
router.post('/search-location', searchLocation);

// User routes
router.post('/send-sms-code', rateLimiter10R1M, sendSMSCode);
router.post('/confirm-sms-code', rateLimiter10R1M, confirmSMSCode);
router.post('/fetch-website-status', fetchWebsiteStatus);
router.post('/confirm-change-sms', rateLimiter10R1M, checkIfAuthenticated, confirmChangeSMS);
router.post('/confirm-backup-email', checkIfAuthenticated, confirmBackupEmail);
router.post('/fetch-user', checkIfAuthenticated, fetchUser);
router.post('/fetch-user-light', fetchUserLight);
router.post('/update-user', checkIfAuthenticated, updateUser)
router.post('/delete-self', rateLimiter10R1M, checkIfAuthenticated, deleteSelf)
router.post('/fetch-subscribed-sites', checkIfAuthenticated, fetchSubscribedSites)
router.post('/check-site-subscribed', checkIfAuthenticated, checkSubscribedSite)
router.post('/fetch-my-data', checkIfAuthenticated, fetchMyData)
router.post('/set-category-blacklisted', checkIfAuthenticated, setCategoryBlacklisted)
router.post('/set-category-unblacklisted', checkIfAuthenticated, setCategoryUnblacklisted)
router.post('/get-blacklisted-categories', checkIfAuthenticated, getBlacklistedCategories)
router.post('/fetch-data-points-count', checkIfAuthenticated, fetchDataPointsCount)
router.post('/check-valid-token', checkValidToken)

// Site Routes
router.post('/fetch-my-sites', checkIfAuthenticated, fetchMySites);
router.post('/fetch-site', fetchSite)
router.post('/fetch-site-via-url', fetchSiteViaUrl)
router.post('/create-site', checkIfAuthenticated, rateLimiter10R1M, createSite);
router.post('/check-site-url-unqiue', checkSiteUrlUnique)
router.post('/update-site', checkIfAuthenticated, rateLimiter10R1M, updateSite);
router.post('/delete-site', checkIfAuthenticated, rateLimiter10R1M, deleteSite);

// Discover Routes
router.post('/discover-fetch-popular-pages', discoverFetchPopularPages);
router.post('/discover-fetch-popular-sites', discoverFetchPopularSites);
router.post('/discover-fetch-new-pages', discoverFetchNewPages);
router.post('/discover-fetch-trending-pages', discoverFetchTrendingPages)
router.post('/discover-fetch-home-pages', discoverFetchHomePages)
router.post('/discover-fetch-subscribed-new-pages', checkIfAuthenticated, discoverFetchSubscribedNewPages)

// Page Builder Routes
router.post('/create-page', checkIfAuthenticated, rateLimiter10R1M, createPage);
router.post('/check-page-url-unqiue', checkPageUrlUnique)
router.post('/fetch-page-via-url', checkIfAuthenticated, fetchPageViaUrl)
router.post('/update-page', checkIfAuthenticated, updatePage);
router.post('/delete-page', checkIfAuthenticated, deletePage);
router.post('/page-section-add', checkIfAuthenticated, pageSectionAdd)
router.post('/page-section-delete', checkIfAuthenticated, pageSectionDelete)
router.post('/page-section-update', checkIfAuthenticated, pageSectionUpdate)
router.post('/page-section-publish', checkIfAuthenticated, pageSectionPublish)
router.post('/page-sections-reorder', checkIfAuthenticated, pageSectionsReorder)
router.post('/fetch-site-pages-recent-updates', fetchSitePagesRecentUpdates)

// Public Page Routes
router.post('/subscribe-to-site', checkIfAuthenticated, subscribeToSite)
router.post('/unsubscribe-to-site', checkIfAuthenticated, unsubscribeToSite)
router.post('/record-page-impression', recordPageImpression)
router.post('/record-page-visit', recordPageVisit)
router.post('/record-page-like', checkIfAuthenticated, recordPageLike)
router.post('/report-page', rateLimiter10R1M, checkIfAuthenticated, reportPage)
router.post('/fetch-page-via-url-public', fetchPageViaUrlPublic)
router.post('/fetch-site-via-url-public', fetchSiteViaUrlPublic)
router.post('/record-page-tags', checkIfAuthenticated, recordPageTags)

router.post('/fetch-more-trending-pages', fetchMoreTrendingPages)
router.post('/fetch-more-new-pages', fetchMoreNewPages)
router.post('/fetch-more-popular-pages', fetchMorePopularPages)

// Super Admin routes
router.post('/admin-fetch-flagged-pages', checkIfAuthenticated, isAdmin, adminFetchFlaggedPages)
router.post('/admin-fetch-users', checkIfAuthenticated, isAdmin, adminFetchUsers)
router.post('/admin-fetch-users-count', checkIfAuthenticated, isAdmin, adminFetchUsersCount)
router.post('/admin-fetch-new-users-count', checkIfAuthenticated, isAdmin, adminFetchNewUsersCount)
router.post('/admin-fetch-new-users', checkIfAuthenticated, isAdmin, adminFetchNewUsers)
router.post('/admin-fetch-new-sites-count', checkIfAuthenticated, isAdmin, adminFetchNewSitesCount)
router.post('/admin-fetch-sites', checkIfAuthenticated, isAdmin, adminFetchSites)
router.post('/admin-fetch-new-pages', checkIfAuthenticated, isAdmin, adminFetchNewPages)
router.post('/admin-fetch-data-points-count', checkIfAuthenticated, isAdmin, adminFetchDataPointsCount)
router.post('/admin-update-page', checkIfAuthenticated, isAdmin, adminUpdatePage)



if (!isProduction()) {
    // Helper routes
    router.get('/setup-indexes', setupIndexes);
    // router.get('/reset', resetDB);
    // Production Schema Update
    router.get('/update-schema', updateSchema)
}


// Errors
router.use(errorHandler)

export default router;
