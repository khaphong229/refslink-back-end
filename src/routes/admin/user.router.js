import {Router} from 'express'
import {asyncHandler} from '@/utils/helpers'
import requireAuthentication from '@/app/middleware/common/admin/require-authentication'
import validate from '@/app/middleware/common/validate'
import * as userMiddleware from '../../app/middleware/user.middleware'
import * as userRequest from '../../app/requests/admin/user.request'
import * as userController from '../../app/controllers/admin/user.controller'

const userRouter = Router()

userRouter.use(asyncHandler(requireAuthentication))

userRouter.get('/', asyncHandler(validate(userRequest.readRoot)), asyncHandler(userController.readRoot))

userRouter.get('/:id', asyncHandler(userMiddleware.checkUserId), asyncHandler(userController.readItem))

userRouter.post('/', asyncHandler(validate(userRequest.createItem)), asyncHandler(userController.createItem))

userRouter.put(
    '/:id',
    asyncHandler(userMiddleware.checkUserId),
    asyncHandler(validate(userRequest.updateItem)),
    asyncHandler(userController.updateItem)
)

userRouter.delete(
    '/:id',
    asyncHandler(userMiddleware.checkUserId),
    userMiddleware.checkCanDeleteUser,
    asyncHandler(userController.removeItem)
)

userRouter.patch(
    '/:id/reset-password',
    asyncHandler(userMiddleware.checkUserId),
    asyncHandler(validate(userRequest.resetPassword)),
    asyncHandler(userController.resetPassword)
)

export default userRouter
