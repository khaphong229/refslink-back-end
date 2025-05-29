import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import * as shortenLinkRankingUserController from '@/app/controllers/client/shorten-link-ranking.user.controller'

const shortenLinkRankingUserRouter = Router()

shortenLinkRankingUserRouter.get('/ranking',
    asyncHandler(requireAuthentication),
    asyncHandler(shortenLinkRankingUserController.getShortenLinksRankingUser)
)

export default shortenLinkRankingUserRouter 