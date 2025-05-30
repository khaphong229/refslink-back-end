import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import { asyncHandler } from '@/utils/helpers'
import { Router } from 'express'
import * as dashboardController from '@/app/controllers/client/dashboard.controller'
const dashboardRouter = Router()

dashboardRouter.get('/', asyncHandler(requireAuthentication), asyncHandler(dashboardController.getAll))

export default dashboardRouter
