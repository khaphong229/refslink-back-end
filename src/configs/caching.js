import _ from 'lodash'
import assert from 'assert'
import {FileSystemCache} from 'file-system-cache'
import {CACHE_DIR} from './constants'

const cache = {
    create(namespace) {
        assert(_.isString(namespace) && !_.isEmpty(namespace), new TypeError('"namespace" is required and must be a string.'))
        const fsCache = new FileSystemCache({
            ns: namespace,
            basePath: CACHE_DIR,
            hash: 'sha256',
            extension: 'json',
        })
        return fsCache
    },
}

export default cache
