import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as shortenLinkController from '@/app/controllers/client/shorten-link.controller'

const publicRedirectRouter = Router()

publicRedirectRouter.get('/:alias', asyncHandler(shortenLinkController.redirectShortenLink))

export default publicRedirectRouter 