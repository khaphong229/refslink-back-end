import moment from 'moment'
import chalk from 'chalk'
import ms from 'ms'
import bytes from 'bytes'

function httpRequestHandler(req, res, next) {
    const currentUrl = req.originalUrl
    req._startTime = moment()
    const end = res.end
    res.end = function (...args) {
        let endTime = moment()
        let processTime = endTime.diff(req._startTime, 'ms')
        res.end = end
        res.end(...args)

        endTime = endTime.format('YYYY-MM-DD HH:mm:ss')
        processTime = ms(processTime)
        const byteLength = bytes(parseInt(res.get('content-length'), 10) || 0)
        const status = res.statusCode

        const msg = `[${endTime}] ${req.method} ${currentUrl} ${status} - ${byteLength} - ${processTime}`

        if (status < 400) {
            console.info(chalk.green(msg))
        } else if (status < 500) {
            console.warn(chalk.yellow(msg))
        } else {
            console.error(chalk.red(msg))
        }
    }

    next()
}

export default httpRequestHandler
