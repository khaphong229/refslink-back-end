import bcrypt from 'bcrypt'
import createModel, { ObjectId } from '../base'
import { infoGeneralUser } from '../admin/admin'

const infoFulledUser = {
    ...infoGeneralUser,
    googleId: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        default: 'inactive',
        required:false
    },
    avatar: {
        type: String,
        default:
            'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.shareicon.net%2Fyoung-man-user-avatar-male-person-103160&psig=AOvVaw0dxsdcGK8woJqVq4BmKHES&ust=1749296985406000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCID3taDd3I0DFQAAAAAdAAAAABAL',
    },
    full_name: {
        type: String,
        default: '',
    },
    first_name: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    birth_date: {
        type: Date,
        default: null,
    },
    gender: {
        type: String,
        default: 'other',
    },
    balance: {
        type: Number,
        default: 0,
    },
    phone: {
        type: String,
        default: '',
    being_paid: {
        type: Number,
        default: 0,
    },
    total_payment: {
        type: Number,
        default: 0,
    },
    total_earned: {
        type: Number,
        default: 0,
    },
    phone: {
        type: String,
        default: '',
    },
    method_withdraw: {
        type: String,
        default: 'bank',
    },
    info_withdraw: {
        type: String,
        default: '',
    },
    ref_code: {
        type: String,
        required: false,
        unique: true,
        default: '',
    },
    ref_by: {
        type: ObjectId,
        required: false,
        ref: 'User',
        default: null,
    },
    country:{
        type:String,
        default: 'VN',
    }
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
