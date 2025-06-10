import { getSettingByName } from './setting.service'

export const getCPMSetting = async () => {
    const setting = await getSettingByName('cpm')
    return setting.value
}

export const getReferralPercentSetting = async () => {
    const setting = await getSettingByName('ref_percent')
    return setting.value
}

export const getScheduledDateSetting = async () => {
    const setting = await getSettingByName('time_paid')
    return setting.value
}

export const getCommissionSettings = async () => {
    const [cpm, refPercent, paid_time] = await Promise.all([
        getCPMSetting(),
        getReferralPercentSetting(),
        getScheduledDateSetting(),
    ])

    return {
        cpm,
        ref_percent: refPercent,
        paid_time,
    }
}
