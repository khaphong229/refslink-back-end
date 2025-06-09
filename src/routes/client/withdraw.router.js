import { Router } from 'express'
import * as withdrawController from '@/app/controllers/client/withdraw.controller'
import { asyncHandler } from '@/utils/helpers'
import * as withdrawRequest from '@/app/requests/client/withdraw.request'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import validate from '@/app/middleware/common/validate'

const router = Router()

router.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(withdrawRequest.createWithdrawRequest)),
    asyncHandler(withdrawController.createWithdrawRequest)
)

router.get(
    '/',
    requireAuthentication,
    asyncHandler(withdrawController.getAllWithdrawRequests)
)

export default router
