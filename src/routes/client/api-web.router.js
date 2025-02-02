import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import {asyncHandler} from '@/utils/helpers'
import {Router} from 'express'
import * as apiWebController from '@/app/controllers/client/api-web.controller'
import * as apiWebRequest from '@/app/requests/client/api-web.request'
import validate from '@/app/middleware/common/validate'
import * as apiWebMiddleware from '@/app/middleware/common/client/api-web.middleware'

const apiWebsRouter = Router()

apiWebsRouter.get('/', asyncHandler(requireAuthentication), asyncHandler(apiWebController.readRoot))

apiWebsRouter.post(
    '/',
    asyncHandler(requireAuthentication),
    asyncHandler(validate(apiWebRequest.createApiWeb)),
    asyncHandler(apiWebController.createApiWeb)
)

apiWebsRouter.get('/:id', asyncHandler(apiWebMiddleware.checkId), asyncHandler(apiWebController.detailApiWeb))

apiWebsRouter.delete(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(apiWebMiddleware.checkId),
    asyncHandler(apiWebController.deleted)
)

apiWebsRouter.put(
    '/:id',
    asyncHandler(requireAuthentication),
    asyncHandler(apiWebMiddleware.checkId),
    asyncHandler(validate(apiWebRequest.createApiWeb)),
    asyncHandler(apiWebController.update)
)

export default apiWebsRouter
