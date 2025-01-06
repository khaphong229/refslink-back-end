import _ from 'lodash'
import assert from 'assert'
import path from 'path'
import statuses from 'statuses'
import {APP_DIR, STATUS_DEFAULT_MESSAGE} from '@/configs'

const NODE_MODULES_DIR = path.join(APP_DIR, 'node_modules')

export function normalizeError(error) {
    assert(_.isError(error), new TypeError('"error" is required and must be an error.'))
    const re = new RegExp(_.escapeRegExp(APP_DIR) + '.*?$', 'gm')
    let stack = error.stack ? error.stack.match(re) : error.stack
    if (_.isArray(stack)) {
        stack = stack
            .map((s) => s.trim())
            .map((s) => (s.endsWith(')') ? s.slice(0, -1) : s))
            .filter((s) => !s.startsWith(NODE_MODULES_DIR))
    }
    return {
        name: error.name || 'Error',
        message: error.message || `${error}`,
        stack,
    }
}

export function abort(statusCode, message, detail) {
    const msg = statuses(statusCode)
    assert(statusCode >= 400, new TypeError(`Invalid response status: ${statusCode}. Please use error status code!`))

    if (_.isObject(message) && _.isUndefined(detail)) {
        [detail, message] = [message, detail]
    }
    assert(_.isNil(message) || _.isString(message), new TypeError('"message" must be a string.'))

    if (!_.isString(message)) {
        message = STATUS_DEFAULT_MESSAGE[statusCode] ?? msg
    }
    const error = new Error(message)
    error.status = statusCode
    error.detail = detail
    throw error
}
