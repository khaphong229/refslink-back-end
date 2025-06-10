export function validateQRCodeRequest(req, res, next) {
    if (!req.body.original_link) {
        return res.status(400).json({ status: 400, success: false, message: 'original_link là bắt buộc', data: null })
    }
    next()
} 