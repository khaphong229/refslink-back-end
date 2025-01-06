import assert from 'assert'
import _ from 'lodash'
import statuses from 'statuses'
import ejs from 'ejs'
import {
    logger,
    MAIL_FROM_ADDRESS,
    MAIL_FROM_NAME,
    mailTransporter,
    STATUS_DEFAULT_MESSAGE,
    VIEW_DIR,
} from '@/configs'
import path from 'path'
import {normalizeError} from '@/utils/helpers'

export function jsonify(data, message) {
    const status = this.statusCode || 200
    assert(status >= 200 && status <= 300, new TypeError(`Invalid response status: ${status}. Please use success status code!`))

    if (_.isString(data) && _.isUndefined(message)) {
        [message, data] = [data, message]
    }
    assert(_.isNil(message) || _.isString(message), new TypeError('"message" must be a string.'))

    const success = true
    if (!_.isString(message)) {
        message = STATUS_DEFAULT_MESSAGE[status] ?? statuses(status)
    }
    return this.json({status, success, message, data})
}

export function sendMail(to, subject, template, data, mailOptions) {
    ejs.renderFile(path.join(VIEW_DIR, template + '.ejs'), {...this.locals, ...data}, function (err, html) {
        if (err) throw err
        mailTransporter.sendMail(
            {
                ...mailOptions,
                from: {
                    address: MAIL_FROM_ADDRESS,
                    name: MAIL_FROM_NAME,
                },
                to,
                subject,
                html,
            },
            function (err) {
                if (!err) return
                const detail = normalizeError(err)
                logger.error({
                    message: 'Error sending email to ' + to,
                    detail,
                })
            }
        )
    })
}
