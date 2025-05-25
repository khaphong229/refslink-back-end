import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import validate from '@/app/middleware/common/validate'
import { asyncHandler } from '@/utils/helpers'
import { Router } from 'express'
import * as shortenLinkRequest from '@/app/requests/client/shorten-link.request'
import * as shortenLinkController from '@/app/controllers/client/shorten-link.controller'
import * as shortenLinkMiddleWare from '@/app/middleware/common/client/shorten-link.middleware'

const shortenLinkRouter = Router()

shortenLinkRouter.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(shortenLinkMiddleWare.checkShortenLink),
    asyncHandler(shortenLinkMiddleWare.getApiWebActive),
    asyncHandler(validate(shortenLinkRequest.create)),
    asyncHandler(shortenLinkController.create)
)

shortenLinkRouter.get('/', asyncHandler(requireAuthentication), asyncHandler(shortenLinkController.getAll))

shortenLinkRouter.get(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(shortenLinkMiddleWare.checkId),
    asyncHandler(shortenLinkController.getById)
)

shortenLinkRouter.patch(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(shortenLinkMiddleWare.checkId),
    asyncHandler(shortenLinkController.hiddenLink)
)

shortenLinkRouter.delete(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(shortenLinkMiddleWare.checkShortenLinkDelete),
    asyncHandler(shortenLinkController.deleteByID)
)

shortenLinkRouter.post('/go', asyncHandler(shortenLinkController.goLink))

export default shortenLinkRouter
