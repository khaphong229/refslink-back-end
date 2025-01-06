import moment from 'moment'
import yaml from 'yaml'
import winston from 'winston'
import assert from 'assert'
import chalk from 'chalk'
import _ from 'lodash'
import {APP_DEBUG, LOG_DIR} from './constants'

const now = () => moment().format('\\[YYYY-MM-DD HH:mm:ss\\]')

const wLogger = winston.createLogger({
    format: winston.format.printf(function (info) {
        const {level, message, ...data} = info
        let msg = `${now()} ${_.upperCase(level)}: ${message}`
        if (!_.isEmpty(data)) {
            msg += '\n' + yaml.stringify(data)
        }
        return msg
    }),
})

const logger = {
    error({message, ...props}) {
        assert(_.isString(message), new TypeError('"message" must be a string.'))

        const {name, stack} = props
        console.error(chalk.redBright(now(), name ? `${name}:` : 'ERROR:', message))
        if (_.isArray(stack) && !_.isEmpty(stack)) {
            const stackStr = stack.map((s) => '- ' + s).join('\n')
            console.error(chalk.redBright(stackStr))
        } else if (_.isString(stack)) {
            console.error(chalk.redBright(stack))
        }

        if (!APP_DEBUG) {
            const fileLog = `node-${moment().format('YYYY-MM-DD')}.log`
            const [transport] = wLogger.transports
            if (transport?.filename !== fileLog) {
                wLogger.configure({
                    transports: new winston.transports.File({
                        filename: fileLog,
                        dirname: LOG_DIR,
                    }),
                })
            }
            return wLogger.error({message, ...props})
        }
    },
}

export default logger
