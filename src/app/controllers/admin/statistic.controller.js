import * as UserService from '@/app/services/admin/user.service'

export async function getUserStatistics(req, res) {
    try {
        const result = await UserService.getUserStatistics()
        res.status(200).jsonify(result)
    } catch (error) {
        res.status(500).jsonify({ message: error.message })
    }
}

export async function getLinkStatistics(req, res) {
    try {
        const result = await UserService.getLinkStatistics()
        res.status(200).jsonify(result)
    } catch (error) {
        res.status(500).jsonify({ message: error.message })
    }
}
