import { getQRCodeOnly } from '@/app/services/client/qrcode.service'

export async function createQRCode(req, res) {
    if (!req.currentUser) {
        return res.status(401).json({ status: 401, success: false, message: 'Vui lòng đăng nhập để tiếp tục.' })
    }
    const { original_link } = req.body
    if (!original_link) {
        return res.status(400).json({ status: 400, success: false, message: 'original_link là bắt buộc', data: null })
    }
    try {
        const data = await getQRCodeOnly(original_link)
        res.status(200).json({
            status: 200,
            success: true,
            message: 'OK',
            data
        })
    } catch (err) {
        res.status(500).json({ status: 500, success: false, message: err.message, data: null })
    }
} 