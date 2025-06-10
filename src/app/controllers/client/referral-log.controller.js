import * as referralLogService from '@/app/services/client/referal-log.service'

export const createReferralLog = async (req, res) => {
    try {
        const referralLog = await referralLogService.createReferralLog(req)

        if (!referralLog) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Không có người giới thiệu',
                data: null,
            })
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Tạo log giới thiệu thành công',
            data: referralLog,
        })
    } catch (error) {
        res.status(error.status || 500).json(error)
    }
}
