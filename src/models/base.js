import mongoose from 'mongoose'

export default function createModel(name, collection, definition, options) {
    const schema = new mongoose.Schema(definition, {
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
        versionKey: false,
        ...(options ?? {}),
    })

    return mongoose.model(name, schema, collection)
}

export const {ObjectId} = mongoose.Types
