import {db} from '@/configs'
import userSeeder from './user.seeder'
import chalk from 'chalk'

async function seed() {
    await db.transaction(async function (session) {
        console.log(chalk.bold('Initializing data...'))

        await userSeeder(session)

        console.log(chalk.bold('Data has been initialized!'))
    })
}

db.connect().then(seed).then(db.close)
