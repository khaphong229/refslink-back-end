import {APP_NAME, APP_URL_API, APP_URL_CLIENT, LINK_STATIC_URL} from '@/configs'

function initLocalsHandler(req, res, next) {
    res.locals.APP_NAME = APP_NAME
    res.locals.APP_URL_API = APP_URL_API
    res.locals.APP_URL_CLIENT = APP_URL_CLIENT
    res.locals.LINK_STATIC_URL = LINK_STATIC_URL
    next()
}

export default initLocalsHandler
