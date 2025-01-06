import Joi from 'joi'
import _ from 'lodash'
import assert from 'assert'
import {abort, validateAsync} from '@/utils/helpers'

function validate(schema) {
    assert(Joi.isSchema(schema), new TypeError('"schema" must be a Joi schema.'))

    return async function (req, res, next) {
        const field = req.method === 'GET' ? 'query' : 'body'

        const [value, error] = await validateAsync(schema, req[field], req)

        if (!_.isEmpty(error)) {
            abort(400, error)
        }

        req[field] = value
        next()
    }
}

export default validate
