import fs from 'fs'
import path from 'path'
import bytes from 'bytes'
import mime from 'mime-types'
import {PUBLIC_DIR, UUID_TRANSLATOR} from '@/configs'

class FileUpload {
    static UPLOAD_FOLDER = 'uploads'

    constructor({originalname, mimetype, buffer}) {
        this.originalname = originalname
        this.mimetype = mimetype
        this.buffer = buffer
        this.filename = `${UUID_TRANSLATOR.generate()}.${mime.extension(this.mimetype)}`
    }

    toJSON() {
        const {buffer, ...rest} = this
        rest.filesize = bytes(Buffer.byteLength(buffer))
        return rest
    }

    toString() {
        return this.filepath || this.originalname
    }

    save(...paths) {
        if (!this.filepath) {
            const uploadDir = path.join(PUBLIC_DIR, FileUpload.UPLOAD_FOLDER, ...paths)
            fs.mkdirSync(uploadDir, {recursive: true})
            fs.writeFileSync(path.join(uploadDir, this.filename), this.buffer)
            this.filepath = path.posix.join(FileUpload.UPLOAD_FOLDER, ...paths, this.filename)
            return this.filepath
        } else {
            throw new Error('File saved. Use the "filepath" attribute to retrieve the file path.')
        }
    }

    static remove(filepath) {
        filepath = path.join(PUBLIC_DIR, filepath)
        if (!fs.existsSync(filepath)) return
        const stats = fs.statSync(filepath)
        if (stats.isFile()) fs.unlinkSync(filepath)
    }
}

export default FileUpload
