import _ from 'lodash'
import assert from 'assert'

export function isAsyncFunction(v) {
    return _.isFunction(v) && v.constructor && v.constructor.name === 'AsyncFunction'
}

export function asyncHandler(fn) {
    assert(isAsyncFunction(fn), new TypeError('"fn" is required and must be an async function.'))
    return function asyncUtilWrap(...args) {
        const fnReturn = fn(...args)
        const next = args[args.length - 1]
        return Promise.resolve(fnReturn).catch(next)
    }
}
