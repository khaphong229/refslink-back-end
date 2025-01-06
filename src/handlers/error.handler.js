import statuses from 'statuses'
import {STATUS_DEFAULT_MESSAGE, logger} from '@/configs'
import {normalizeError} from '../utils/helpers'

function errorHandler(err, req, res, next) {
    if (err instanceof Error) {
        const success = false
        let status = err.status || err.statusCode
        if (status) {
            res.status(status).json({
                status,
                success,
                message: err.message,
                detail: err.detail,
            })
            return
        }

        const nError = normalizeError(err)
        logger.error({
            ...nError,
            request: {
                method: req.method,
                originalUrl: req.originalUrl,
                headers: req.headers,
                body: req.body,
            },
        })

        status = 500
        const message = STATUS_DEFAULT_MESSAGE[status] ?? statuses(status)
        res.status(status).json({
            status,
            success,
            message,
        })
        return
    }

    res.sendStatus(500)
    next(err)
}

export default errorHandler
