import jwt, {JsonWebTokenError} from 'jsonwebtoken'
import _ from 'lodash'
import assert from 'assert'
import {SECRET_KEY} from '@/configs'

export function generateToken(data, type, expiresIn, secretKey) {
    assert(!_.isNil(data), new TypeError('"data" is required.'))
    assert(_.isString(type) && !_.isEmpty(type), new TypeError('"type" is required and must be a string.'))
    assert(
        _.isUndefined(secretKey) || (_.isString(secretKey) && !_.isEmpty(secretKey)),
        new TypeError('"secretKey" must be a string and cannot be empty.')
    )

    return jwt.sign({type, data}, secretKey ?? SECRET_KEY, {
        ...(!_.isNil(expiresIn) && {expiresIn}),
    })
}

export function verifyToken(token, validType, secretKey) {
    assert(_.isString(token) && !_.isEmpty(token), new TypeError('"token" is required and must be a string.'))
    assert(_.isString(validType) && !_.isEmpty(validType), new TypeError('"validType" is required and must be a string.'))
    assert(
        _.isUndefined(secretKey) || (_.isString(secretKey) && !_.isEmpty(secretKey)),
        new TypeError('"secretKey" must be a string and cannot be empty.')
    )

    const {type, data} = jwt.verify(token, secretKey ?? SECRET_KEY)
    if (type !== validType) {
        throw new JsonWebTokenError()
    }
    return data
}

export function getToken(headers) {
    const token = headers.authorization
    if (token) {
        const match = token.match(/Bearer\s*(.+)/)
        if (match && match.length > 1) {
            return match[1]
        }
    }
}
