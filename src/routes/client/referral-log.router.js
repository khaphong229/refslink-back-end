import express from 'express'
import * as referralLogController from '@/app/controllers/client/referral-log.controller'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'

const referralLogRouter = express.Router()

referralLogRouter.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(referralLogController.createReferralLog)
)

export default referralLogRouter
