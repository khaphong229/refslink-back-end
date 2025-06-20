import express from 'express'
import * as SupportController from '@/app/controllers/client/support.controller'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'

import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/common/validate'
import * as supportRequest from '@/app/requests/client/support.request'

const supportRouter = express.Router()

supportRouter.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(supportRequest.create)),
    asyncHandler(SupportController.create)
)


export default supportRouter
