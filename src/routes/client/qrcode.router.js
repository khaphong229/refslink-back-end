import { Router } from 'express'
import requireAuthentication from '@/app/middleware/common/client/require-authentication'
import { validateQRCodeRequest } from '@/app/middleware/common/client/qrcode.middleware'
import { createQRCode } from '@/app/controllers/client/qrcode.controller'
import { asyncHandler } from '@/utils/helpers'

const qrcodeRouter = Router()

qrcodeRouter.post(
    '/get-qrcode',
    validateQRCodeRequest,
    asyncHandler(requireAuthentication),
    asyncHandler(createQRCode)
)

export default qrcodeRouter 