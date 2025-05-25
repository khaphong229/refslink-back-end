import { Router } from 'express'
import requireAuthentication from '../app/middleware/common/client/require-authentication.js'
import ShortenTool from '../app/middleware/common/client/get_token_by_user_id.js'

const router = Router()

router.post('/', requireAuthentication, async (req, res) => {
    const { type, domains, advert } = req.body

    if (!type || !domains || !Array.isArray(domains)) {
        return res.status(400).json({ error: 'type và domains là bắt buộc và domains phải là mảng' })
    }

    const userId = req.currentUser._id
    if (!userId) {
        return res.status(401).json({ error: 'User ID không tồn tại' })
    }

    try {
        const shortenTool = await ShortenTool.findOne({ user_id: userId }).exec()
        if (!shortenTool) {
            return res.status(404).json({ error: 'Token rút gọn không tìm thấy cho user này' })
        }

        // Cấu hình
        const app_url = 'http://localhost:3111/'
        const app_type = JSON.stringify(type)
        const app_api_token = shortenTool.token
        const app_advert = typeof advert === 'number' ? advert : 2
        const app_domains = JSON.stringify(domains)

        // Script cấu hình + script nhúng
        const scriptContent = `
<script type="text/javascript">
    var app_url = '${app_url}';
    var app_api_token = '${app_api_token}';
    var app_type = ${app_type};
    var app_advert = ${app_advert};
    var app_domains = ${app_domains};
</script>
<script src="${app_url}js/full-page-script.js"></script>
        `.trim()

        res.set('Content-Type', 'text/javascript').send(scriptContent)

    } catch (error) {
        console.error('Lỗi server:', error)
        res.status(500).json({ error: 'Lỗi server khi lấy token' })
    }
})

export default router
