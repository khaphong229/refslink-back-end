import { Router } from 'express'
import * as withdrawController from '@/app/controllers/admin/withdraw.controller'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentications from '@/app/middleware/common/admin/require-authentication'

const router = Router()

router.use(asyncHandler(requireAuthentications))  

router.get(
    '/',
    asyncHandler(withdrawController.getAllWithdrawRequests)
)

router.patch(
    '/:id/status',
    asyncHandler(withdrawController.updateWithdrawStatus)
)

export default router
