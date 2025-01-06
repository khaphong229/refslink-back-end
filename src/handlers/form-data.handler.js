import _ from 'lodash'
import {FileUpload} from '../utils/classes'

function formDataHandler(req, res, next) {
    const files = req.files

    if (files) {
        for (let file of files) {
            const fieldname = file.fieldname
            file = new FileUpload(file)

            if (_.isUndefined(req.body[fieldname])) {
                req.body[fieldname] = file
            } else {
                if (_.isArray(req.body[fieldname])) {
                    req.body[fieldname].push(file)
                } else {
                    req.body[fieldname] = [req.body[fieldname], file]
                }
            }
        }

        delete req.files
    }

    next()
}

export default formDataHandler
