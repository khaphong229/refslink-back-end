import express from 'express'
import * as SupportController from '@/app/controllers/admin/support.controller'
import requireAuthentications from '@/app/middleware/common/admin/require-authentication'
import { asyncHandler } from '@/utils/helpers'

const supportRouter = express.Router()

supportRouter.get(
    '/',
    asyncHandler(SupportController.getAll),
    asyncHandler(requireAuthentications)
)

export default supportRouter
