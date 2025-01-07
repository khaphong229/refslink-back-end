import mongoose from 'mongoose'
// import {DATABASE_URI, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_AUTH_SOURCE} from './constants'

// const mongoDb = {
//     connect() {
//         return mongoose.connect(DATABASE_URI, {
//             dbName: DB_NAME,
//             user: DB_USERNAME,
//             pass: DB_PASSWORD,
//             authSource: DB_AUTH_SOURCE,
//             autoCreate: true,
//             autoIndex: true,
//             connectTimeoutMS: 5000,
//             socketTimeoutMS: 5000,
//             serverSelectionTimeoutMS: 5000,
//         })
//     },
//     close(force) {
//         return mongoose.connection.close(force)
//     },
//     transaction(...args) {
//         return mongoose.connection.transaction(...args)
//     },
//     isDisconnected() {
//         return mongoose.connection.readyState === 0
//     },
// }

// export default mongoDb

const mongoDb = {
    connect: async () => {
        const uri = process.env.MONGO_DB_CLOUD

        if (!uri) {
            console.error('MongoDB connection URI is not defined.')
            process.exit(1)
        }

        try {
            await mongoose.connect(uri, {
                autoCreate: true,
                autoIndex: true,
                connectTimeoutMS: 5000,
                socketTimeoutMS: 5000,
                serverSelectionTimeoutMS: 5000,
            })
            console.log('Connected to MongoDB')
        } catch (error) {
            console.error('Error connecting to MongoDB:', error)
            process.exit(1)
        }
    },
    close: (force) => {
        return mongoose.connection.close(force)
    },
    transaction: (...args) => {
        return mongoose.connection.transaction(...args)
    },
    isDisconnected: () => {
        return mongoose.connection.readyState === 0
    },
}

export default mongoDb
