import { Router } from 'express'
import * as withdrawController from '@/app/controllers/client/withdraw.controller'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'

const router = Router()

router.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(withdrawController.createWithdrawRequest)
)

router.get(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(withdrawController.getAllWithdrawRequests)
)

export default router
