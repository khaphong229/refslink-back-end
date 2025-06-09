import { Router } from 'express'
import * as referralController from '@/app/controllers/client/referral.controller'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'

const referalRouter = Router()

referalRouter.get(
    '/info',
    asyncHandler(requireAuthentication),
    asyncHandler(referralController.getReferralInfo)
)

referalRouter.get(
    '/refered-users',
    asyncHandler(requireAuthentication),
    asyncHandler(referralController.getReferredUsers)
)

referalRouter.get('/referer', referralController.getReferrerInfo)

export default referalRouter
