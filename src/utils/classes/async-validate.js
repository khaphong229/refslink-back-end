import _ from 'lodash'
import assert from 'assert'

class AsyncValidate {
    constructor(value, exec) {
        assert(_.isFunction(exec), new TypeError('"exec" is required and must be a function.'))
        this.value = value
        this.exec = exec
    }

    valueOf() {
        return this.value
    }

    equals(other, comparator = _.isEqual) {
        if (other instanceof AsyncValidate) {
            return comparator(this.value, other.value)
        }
        return false
    }
}

export default AsyncValidate
