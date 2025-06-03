import Setting from '@/models/admin/setting.model'

// Lấy tất cả settings
export const getAllSettings = async () => {
    return await Setting.find()
}

// Lấy setting theo name
export const getSettingByName = async (name) => {
    const setting = await Setting.findOne({ name })
    if (!setting) {
        throw {
            status: 404,
            success: false,
            message: 'Không tìm thấy cài đặt',
            data: null,
        }
    }
    return setting
}

// Cập nhật setting
export const updateSetting = async (name, data) => {
    const setting = await Setting.findOneAndUpdate({ _id: name }, data, { new: true })
    if (!setting) {
        throw {
            status: 404,
            success: false,
            message: 'Không tìm thấy cài đặt',
            data: null,
        }
    }
    return setting
}

// Tạo setting mới
export const createSetting = async (data) => {
    try {
        // Kiểm tra setting đã tồn tại chưa
        const existingSetting = await Setting.findOne({ name: data.name })
        if (existingSetting) {
            throw {
                status: 400,
                success: false,
                message: 'Cài đặt đã tồn tại',
                data: null,
            }
        }

        const setting = new Setting(data)
        await setting.save()
        return setting
    } catch (error) {
        if (error.code === 11000) {
            throw {
                status: 400,
                success: false,
                message: 'Cài đặt đã tồn tại',
                data: null,
            }
        }
        throw error
    }
}

// Xóa setting
export const deleteSetting = async (name) => {
    const setting = await Setting.findOneAndDelete({ name })
    if (!setting) {
        throw {
            status: 404,
            success: false,
            message: 'Không tìm thấy cài đặt',
            data: null,
        }
    }
    return setting
}
