import fs from 'fs'
import path from 'path'
import bytes from 'bytes'
import mime from 'mime-types'
import {PUBLIC_DIR, UUID_TRANSLATOR} from '@/configs'

class FileUpload {
    static UPLOAD_FOLDER = 'uploads'

    constructor({originalname, mimetype, buffer}) {
        this.originalname = originalname
        this.mimetype = mimetype // image/jpeg hoặc application/pdf.
        this.buffer = buffer

        // Sử dụng UUID_TRANSLATOR để tạo tên file duy nhất và lấy phần mở rộng từ mimetype
        this.filename = `${UUID_TRANSLATOR.generate()}.${mime.extension(this.mimetype)}`
    }

    toJSON() {
        const {buffer, ...rest} = this
        rest.filesize = bytes(Buffer.byteLength(buffer))
        // convert byte => 2.1MB ,3KB => người hiểu
        return rest
    }

    toString() {
        return this.filepath || this.originalname
        //filepath đã được thiết lập (sau khi file đã được lưu), thì sẽ trả
        // về đường dẫn đó, ngược lại trả về originalname.
    }

    save(...paths) {
        if (!this.filepath) {
            // Khai báo đường dẫn lưu file
            const uploadDir = path.join(PUBLIC_DIR, FileUpload.UPLOAD_FOLDER, ...paths)
            fs.mkdirSync(uploadDir, {recursive: true}) // Tạo thư mục nếu nó chưa tồn tại

            // Lưu file vào hệ thống
            fs.writeFileSync(
                path.join(uploadDir, this.filename),
                this.buffer
                // finalFilePath => cuối cùng
            )

            // Gán đường dẫn của file đã lưu
            this.filepath = path.posix.join(FileUpload.UPLOAD_FOLDER, ...paths, this.filename)
            return this.filepath
        } else {
            throw new Error('File saved. Use the "filepath" attribute to retrieve the file path.')
        }
    }

    static remove(filepath) {
        filepath = path.join(PUBLIC_DIR, filepath)
        // chuyển thành tuyệt đối để xóa =)))
        if (!fs.existsSync(filepath)) return
        const stats = fs.statSync(filepath)
        if (stats.isFile()) fs.unlinkSync(filepath)
    }
}

export default FileUpload
