import express from 'express'
import * as shortenToolMiddleware from '@/app/middleware/common/client/shorten-tool.middleware'
import * as shortenToolController from '@/app/controllers/client/shorten-tool.controller'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'

import * as shortenLinkMiddleWare from '@/app/middleware/common/client/shorten-link.middleware'

import { asyncHandler } from '@/utils/helpers'

const router = express.Router()

router.get(
    '/api-token',
    asyncHandler(requireAuthentication),
    asyncHandler(shortenToolMiddleware.validateGetTokenRequest),
    asyncHandler(shortenToolController.getOrCreateToken)
)

router.get(
    '/st',
    asyncHandler(shortenToolMiddleware.validateShortenToolRequest),
    asyncHandler(shortenLinkMiddleWare.getApiWebActive),
    (req, res) => shortenToolController.shortenUrl(req, res, 'quicklink')
)

router.post(
    '/st/bulk',
    asyncHandler(requireAuthentication),
    (req, res, next) => shortenLinkMiddleWare.checkShortenLink(req, res, next, 'multiple'),
    asyncHandler(shortenLinkMiddleWare.getApiWebActive),
    asyncHandler(shortenToolController.shortenBulkUrls)
)

router.get(
    '/api',
    asyncHandler(shortenToolMiddleware.validateDevelopApi),
    asyncHandler(shortenLinkMiddleWare.getApiWebActive),
    asyncHandler(shortenToolController.shortenDevelopApi)
)

export default router
