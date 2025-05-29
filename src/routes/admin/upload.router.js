import {LINK_STATIC_URL} from '@/configs'
import formDataHandler from '@/handlers/form-data.handler'
import {Router} from 'express'
import multer from 'multer'

const uploadRouter = Router()

export default uploadRouter
const upload = multer({storage: multer.memoryStorage()})
uploadRouter.post(
    '',
    (upload.any(),
    formDataHandler,
    (req, res) => {
        try {
            const files = req.body
            // Tất cả các file và tên trường file sẽ nằm trong req.body sau khi formDataHandler xử lý

            if (!files || Object.keys(files).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                })
            }

            const savedFiles = []
            // Duyệt qua từng field name trong req.body (từ formDataHandler)
            Object.keys(files).forEach((fieldname) => {
                const fieldFiles = files[fieldname]

                if (Array.isArray(fieldFiles)) {
                    // Nếu có nhiều file trong cùng một field
                    fieldFiles.forEach((file) => {
                        file.save(fieldname) // Lưu file vào thư mục theo tên field
                        const fileInfo = file.toJSON()
                        const {filepath} = fileInfo
                        savedFiles.push({
                            fieldname: fieldname,
                            ...fileInfo,
                            url: LINK_STATIC_URL + filepath,
                        })
                    })
                } else {
                    // Nếu chỉ có một file
                    fieldFiles.save(fieldname)
                    const fileInfo = fieldFiles.toJSON()
                    const {filepath} = fileInfo
                    savedFiles.push({
                        fieldname: fieldname, // Tên field
                        ...fileInfo,
                        url: LINK_STATIC_URL + filepath,
                    })
                }
            })

            res.status(200).json({
                success: true,
                message: 'Files uploaded successfully',
                files: savedFiles,
            })
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'File upload failed',
                error: err.message,
            })
        }
    })
)
