import { Router } from 'express'
import * as withdrawController from '@/app/controllers/admin/withdraw.controller'
import { asyncHandler } from '@/utils/helpers'


const router = Router()

router.get(
    '/',
    asyncHandler(withdrawController.getAllWithdrawRequests)
)

router.patch(
    '/:id/status',
    asyncHandler(withdrawController.updateWithdrawStatus)
)

export default router
