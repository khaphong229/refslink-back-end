import { getSettingByName } from './setting.service'

export const getCPMSetting = async () => {
    const setting = await getSettingByName('cpm')
    return setting.value
}

export const getReferralPercentSetting = async () => {
    const setting = await getSettingByName('ref_percent')
    return setting.value
}

export const getCommissionSettings = async () => {
    const [cpm, refPercent] = await Promise.all([getCPMSetting(), getReferralPercentSetting()])

    return {
        cpm,
        ref_percent: refPercent,
    }
}
