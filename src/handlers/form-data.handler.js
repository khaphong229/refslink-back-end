import _ from 'lodash'
import {FileUpload} from '../utils/classes'

function formDataHandler(req, res, next) {
    const files = req.files
    // console.log('rq.files : ', req.files)

    if (files) {
        for (let file of files) {
            const fieldname = file.fieldname //logo
            file = new FileUpload(file)

            if (_.isUndefined(req.body[fieldname])) {
                req.body[fieldname] = file // => 1 obj
            } else {
                if (_.isArray(req.body[fieldname])) {
                    req.body[fieldname].push(file) // => push vào mảng
                } else {
                    req.body[fieldname] = [req.body[fieldname], file] // => 1 mảng
                }
            }
            // console.log('field :', fieldname)
            // console.log('file :', file)
        }

        delete req.files
    }

    next()
}

export default formDataHandler
