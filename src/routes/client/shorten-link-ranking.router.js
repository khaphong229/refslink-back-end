import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import * as shortenLinkRankingController from '@/app/controllers/client/shorten-link-ranking.controller'

const shortenLinkRankingRouter = Router()

shortenLinkRankingRouter.get('/ranking', asyncHandler(shortenLinkRankingController.getShortenLinksRanking))

export default shortenLinkRankingRouter 