import { Router } from 'express'

import validate from '@/app/middleware/common/validate'
import * as settingController from '../../app/controllers/admin/setting.controller'
import * as settingRequest from '../../app/requests/admin/setting.request'
import { asyncHandler } from '@/utils/helpers'
import requireAuthentications from '@/app/middleware/common/admin/require-authentication'

const settingRouter = Router()

// Tất cả routes đều yêu cầu xác thực admin
settingRouter.use(requireAuthentications)

// Lấy tất cả settings
settingRouter.get('/', asyncHandler(settingController.getAllSettings))

// Lấy setting theo name
settingRouter.get('/:name', asyncHandler(settingController.getSettingByName))

// Cập nhật setting
settingRouter.put(
    '/:name',
    validate(settingRequest.updateSetting),
    asyncHandler(settingController.updateSetting)
)

// Tạo setting mới
settingRouter.post('/', validate(settingRequest.createSetting), asyncHandler(settingController.createSetting))

// Xóa setting
settingRouter.delete('/:name', asyncHandler(settingController.deleteSetting))

export default settingRouter
