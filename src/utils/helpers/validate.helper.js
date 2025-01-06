import Joi from 'joi'
import _ from 'lodash'
import assert from 'assert'
import {JOI_DEFAULT_OPTIONS} from '@/configs'
import {AsyncValidate} from '@/utils/classes'

export async function validateAsync(schema, data, ...args) {
    assert(Joi.isSchema(schema), new TypeError('"schema" must be a Joi schema.'))

    let errorDetails = {}

    async function dfs(variable) {
        if (variable instanceof AsyncValidate) {
            variable = await variable.exec(...args)
            if (variable?.prefs) {
                const property = variable.path.join('.')
                if (!(property in errorDetails)) {
                    errorDetails[property] = `${variable}`
                }
            }
        } else if (_.isPlainObject(variable) || _.isArray(variable)) {
            for (const key in variable) {
                if (_.isObject(variable[key])) {
                    variable[key] = await dfs(variable[key])
                }
            }
        }

        return variable
    }

    let {value, error} = schema.validate(data, {
        ...JOI_DEFAULT_OPTIONS,
        context: {
            data: _.cloneDeep(data),
        },
    })

    if (error) {
        error = error.details.reduce(function (pre, curr) {
            const path = curr.path.join('.')
            if (!(path in pre)) {
                pre[path] = curr.message
            }
            return pre
        }, {})

        errorDetails = error
    }

    value = await dfs(value)

    return [value, errorDetails]
}

export function tryValidateOrDefault(...args) {
    const defaultValue = args.pop()
    return Joi.alternatives()
        .try(...args, Joi.any().empty(Joi.any()))
        .default(defaultValue)
}
