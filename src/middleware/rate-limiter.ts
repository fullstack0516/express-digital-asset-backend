import * as rateLimit from 'express-rate-limit'
import { isTestMode } from '../..';
import { isProduction } from '../utils/config';
import { RouteError } from '../utils/route-error';

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const rateLimitReachStatusCode = 'rate-limit-reached';
const rateLimitReachStatusMessage = 'The rate limit has been reached';

const skipTestMode = (req, res) => {
    if (isTestMode() || !isProduction()) {
        return true;
    }
    return false;
}

/**
 * 2R = 2 Requests
 * 2M = 2 Minutes
 */
export const rateLimiter2R2M = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 2,
    handler: (req, res, next) => {
        if (isTestMode()) {
            next()
            return
        }
        throw new RouteError(rateLimitReachStatusCode, rateLimitReachStatusMessage)
    },
    skip: skipTestMode,
});

/**
 * 10R = 10 Requests
 * 1M = 1 Minutes
 */
export const rateLimiter10R1M = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    handler: (req, res, next) => {
        if (isTestMode()) {
            next()
            return
        }
        throw new RouteError(rateLimitReachStatusCode, rateLimitReachStatusMessage)
    },
    skip: skipTestMode,
});


/**
 * 30R = 30 Requests
 * 1M = 1 Minutes
 */
export const rateLimiter30R1M = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    handler: (req, res, next) => {
        if (isTestMode()) {
            next()
            return
        }
        throw new RouteError(rateLimitReachStatusCode, rateLimitReachStatusMessage)
    },
    skip: skipTestMode,
});
