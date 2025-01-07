import createModel from '../base'
import bcrypt from 'bcrypt'

export const infoGeneralUser = {
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        set(password) {
            const salt = bcrypt.genSaltSync(10)
            return bcrypt.hashSync(password, salt)
        },
    },
    phone: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true,
        default: 'active',
    },
    avatar: {
        type: String,
        required: false,
    },
}

const Admin = createModel('Admin', 'admins', infoGeneralUser, {
    toJSON: {
        virtuals: false,
        transform(doc, ret) {
            // eslint-disable-next-line no-unused-vars
            const {password, ...result} = ret
            return result
        },
    },
    methods: {
        verifyPassword(password) {
            return bcrypt.compareSync(password, this.password)
        },
    },
})

export default Admin
