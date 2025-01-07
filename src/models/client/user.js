import bcrypt from 'bcrypt'
import createModel from '../base'
import {infoGeneralUser} from '../admin/admin'
import mongoose from 'mongoose'

const infoFulledUser = {
    ...infoGeneralUser,
    address: {
        type: String,
    },
    birth_date: {
        type: Date,
    },
    gender: {
        type: String,
    },
    category_care: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    social_media: {
        type: [String],
    },
    successful_exchanges: {
        type: Number,
        default: 0,
    },
    last_login: {
        type: Date,
    },
}

const User = createModel('User', 'users', infoFulledUser, {
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

export default User
