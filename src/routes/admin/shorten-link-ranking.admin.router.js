import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
// import requireAuthentication from '@/app/middleware/common/admin/require-authentication'
import * as shortenLinkRankingAdminController from '@/app/controllers/admin/shorten-link-ranking.admin.controller'

const shortenLinkRankingAdminRouter = Router()

shortenLinkRankingAdminRouter.get('/ranking',
    // asyncHandler(requireAuthentication),
    asyncHandler(shortenLinkRankingAdminController.getShortenLinksRankingAdmin)
)

export default shortenLinkRankingAdminRouter 