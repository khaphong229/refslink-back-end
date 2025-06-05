import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        is_public: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

const Setting = mongoose.model('Setting', settingSchema)

export default Setting
