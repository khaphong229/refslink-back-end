import * as StatisticService from '@/app/services/admin/statistic.service'

export async function getUserStatistics(req, res) {
    try {
        const result = await StatisticService.getUserStatistics()
        res.status(200).jsonify(result)
    } catch (error) {
        res.status(500).jsonify({ message: error.message })
    }
}

export async function getLinkStatistics(req, res) {
    try {
        const result = await StatisticService.getLinkStatistics()
        res.status(200).jsonify(result)
    } catch (error) {
        res.status(500).jsonify({ message: error.message })
    }
}

export async function getLinkStatisticsByDateController(req, res) {
    try {
        const { from, to } = req.query
        const stats = await StatisticService.getLinkStatisticsByDate({ from, to })
        res.status(200).jsonify(stats)
    } catch (error) {
        res.status(500).jsonify({ message: error.message })
    }
}

export async function getUserStatisticsByDate(req, res) {
    try {
        const { from, to } = req.query
        const stats = await StatisticService.getUserStatisticsByDate({ from, to })
        res.status(200).jsonify(stats)
    } catch (error) {
        res.status(500).jsonify({ message: error.message })
    }
}

export async function getDashboardSummary(req, res) {
    try {
        const summary = await StatisticService.getDashboardSummary()
        res.status(200).jsonify(summary)
    } catch (error) {
        res.status(500).jsonify({ message: error.message })
    }
}
