import QRCode from 'qrcode'
import { APP_URL_CLIENT } from '@/configs'

export async function generateQRCode(link) {
    try {
        return await QRCode.toDataURL(link)
    } catch (err) {
        throw new Error('Không thể tạo QR code')
    }
}

export async function getQRCodeOnly(original_link) {
    const data = await generateQRCode(original_link)
    return { data }
}

function getDomain(url) {
    try {
        return new URL(url).origin
    } catch {
        return ''
    }
}

export async function getQrcodeWithShortenIfNeeded(original_link) {
    const inputDomain = getDomain(original_link)
    const appDomain = APP_URL_CLIENT.replace(/\/$/, '')
    if (inputDomain === appDomain) {
        const qrcode = await generateQRCode(original_link)
        return {
            link: original_link,
            qrcode
        }
    }
}