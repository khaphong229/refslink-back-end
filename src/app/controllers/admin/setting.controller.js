import * as settingService from '@/app/services/admin/setting.service'

// Lấy tất cả settings
export const getAllSettings = async (req, res) => {
    const settings = await settingService.getAllSettings()
    res.status(200).json({
        status: 200,
        success: true,
        message: 'Lấy danh sách cài đặt thành công',
        data: { data: settings },
    })
}

// Lấy setting theo name
export const getSettingByName = async (req, res) => {
    try {
        const { name } = req.params
        const setting = await settingService.getSettingByName(name)
        res.status(200).json({
            status: 200,
            success: true,
            message: 'Lấy cài đặt thành công',
            data: setting,
        })
    } catch (error) {
        res.status(error.status || 500).json(error)
    }
}

// Cập nhật setting
export const updateSetting = async (req, res) => {
    try {
        const { name } = req.params
        const { value, description, is_public } = req.body
        const setting = await settingService.updateSetting(name, { value, description, is_public })
        res.status(200).json({
            status: 200,
            success: true,
            message: 'Cập nhật cài đặt thành công',
            data: setting,
        })
    } catch (error) {
        res.status(error.status || 500).json(error)
    }
}

// Tạo setting mới
export const createSetting = async (req, res) => {
    try {
        const { name, value, description, is_public } = req.body
        const setting = await settingService.createSetting({ name, value, description, is_public })
        res.status(201).json({
            status: 201,
            success: true,
            message: 'Tạo cài đặt thành công',
            data: setting,
        })
    } catch (error) {
        res.status(error.status || 500).json(error)
    }
}

// Xóa setting
export const deleteSetting = async (req, res) => {
    try {
        const { name } = req.params
        await settingService.deleteSetting(name)
        res.status(200).json({
            status: 200,
            success: true,
            message: 'Xóa cài đặt thành công',
            data: null,
        })
    } catch (error) {
        res.status(error.status || 500).json(error)
    }
}
