import nodeMailer from 'nodemailer'
import {MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_SECURE} from '@/configs'

const mailTransporter = nodeMailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE,
    auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
})

export default mailTransporter
