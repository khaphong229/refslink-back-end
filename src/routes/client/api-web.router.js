import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import {asyncHandler} from '@/utils/helpers'
import {Router} from 'express'
import * as apiWebController from '@/app/controllers/client/api-web.controller'
import * as apiWebRequest from '@/app/requests/client/api-web.request'
import validate from '@/app/middleware/common/validate'

const apiWebsRouter = Router()

apiWebsRouter.get('/', asyncHandler(requireAuthentication), asyncHandler(apiWebController.readRoot))

apiWebsRouter.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(apiWebRequest.createApiWeb)),
    asyncHandler(apiWebController.createApiWeb)
)

export default apiWebsRouter
