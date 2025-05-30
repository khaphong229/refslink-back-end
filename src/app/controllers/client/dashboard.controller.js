import * as dashboardService from '@/app/services/client/dashboard.service'

export const getAll = async (req, res) => {
    const statistics = await dashboardService.getStatistics(req)
    res.status(200).jsonify(statistics)
}
