import { Router } from 'express'

const router = Router()

// POST /api/generate-script
router.post('/', (req, res) => {
    const { type, domains, api_token, advert } = req.body
    if (!type || !domains || !Array.isArray(domains)) {
        return res.status(400).json({ error: 'type and domains are required' })
    }
    // Cố định domain của bạn
    const app_url = 'http://localhost:3111/'
    const app_api_token = api_token || 'YOUR_API_TOKEN_HERE'
    const app_advert = typeof advert === 'number' ? advert : 2
    const app_domains = JSON.stringify(domains)
    // Tạo script cấu hình
    const configScript = `<script type="text/javascript">
    var app_url = '${app_url}';
    var app_api_token = '${app_api_token}';
    var app_advert = ${app_advert};
    var app_domains = ${app_domains};
</script>`
    // Script src
    const srcScript = '<script src=\'//localhost:3111/js/full-page-script.js\'></script>'
    // Output
    res.type('text/plain').send(configScript + '\n' + srcScript)
})

export default router 