import { Router } from 'express'
import * as StatisticController from '@/app/controllers/admin/statistic.controller'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentications from '@/app/middleware/common/admin/require-authentication'

const router = Router()

router.use(asyncHandler(requireAuthentications))

router.get('/users', asyncHandler(StatisticController.getUserStatistics))
router.get('/shorten-links', asyncHandler(StatisticController.getLinkStatistics))
router.get('/shorten-links/by-date', asyncHandler(StatisticController.getLinkStatisticsByDateController))
router.get('/users/by-date', asyncHandler(StatisticController.getUserStatisticsByDate))
router.get('/dashboard/summary', asyncHandler(StatisticController.getDashboardSummary))

export default router
