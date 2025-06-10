import ShortenLink from '@/models/client/shorten-link'
import { getCommissionSettings } from '../admin/commission.service'
import { updateUserBalance } from './balance.service'

async function calculateLinkEarnings(link) {
    const { cpm } = await getCommissionSettings()
    const earnedAmount = (link.valid_clicks * cpm) / 1000
    return earnedAmount
}

export async function updateLinkEarnings(linkId) {
    try {
        const link = await ShortenLink.findById(linkId)
        if (!link) return null

        const earnedAmount = await calculateLinkEarnings(link)

        link.earned_amount = earnedAmount
        await link.save()

        await updateUserBalance(link.user_id)

        return link
    } catch (error) {
        console.error('Lỗi khi cập nhật earned_amount:', error)
        throw error
    }
}

export async function updateAllUserLinksEarnings(userId) {
    try {
        const links = await ShortenLink.find({ user_id: userId })

        for (const link of links) {
            await updateLinkEarnings(link._id)
        }

        await updateUserBalance(userId)

        return links
    } catch (error) {
        console.error('Lỗi khi cập nhật earned_amount cho tất cả link:', error)
        throw error
    }
}

export async function updateAllLinksEarnings() {
    try {
        const links = await ShortenLink.find()

        for (const link of links) {
            await updateLinkEarnings(link._id)
        }

        return { success: true, message: 'Đã cập nhật earned_amount cho tất cả link' }
    } catch (error) {
        console.error('Lỗi khi cập nhật earned_amount cho tất cả link:', error)
        throw error
    }
}
