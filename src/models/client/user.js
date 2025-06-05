import bcrypt from 'bcrypt'
import createModel, { ObjectId } from '../base'
import { infoGeneralUser } from '../admin/admin'

const infoFulledUser = {
    ...infoGeneralUser,
    googleId: {
        type: String,
    },
    status: {
        type: String,
        required: true,
        default: 'inactive',
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/dqj0xgk8v/image/upload/v1695860982/avater/avater-default.png',
    },
    full_name: {
        type: String,
    },
    first_name: {
        type: String,
    },
    address: {
        type: String,
    },
    birth_date: {
        type: Date,
    },
    gender: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0,
    },
    phone: {
        type: String,
    },
    total_earned: {
        type: Number,
        default: 0,
    },
    method_withdraw: {
        type: String,
        default: 'bank',
    },
    info_withdraw: {
        type: String,
    },
    ref_code: {
        type: String,
        required: false,
        unique: true,
    },
    ref_by: {
        type: ObjectId,
        required: false,
        ref: 'User',
    },
}

const User = createModel('User', 'users', infoFulledUser, {
    toJSON: {
        virtuals: false,
        transform(doc, ret) {
            // eslint-disable-next-line no-unused-vars
            const { password, ...result } = ret
            return result
        },
    },
    methods: {
        verifyPassword(password) {
            return bcrypt.compareSync(password, this.password)
        },
    },
})

export default User
