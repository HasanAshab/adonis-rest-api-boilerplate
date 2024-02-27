import { Command } from 'samer-artisan'
import DB from 'db'
import User from '~/app/models/user'
import Settings from '~/app/models/settings'

export default class MakeAdmin extends Command {
  signature = 'create:admin {name?} {username} {email} {password}'

  async handle() {
    await DB.connect()
    const admin = await User.create({
      ...this.arguments(),
      role: 'admin',
      verified: true,
    })
    await admin.createDefaultSettings()
    this.info('Admin account created successfully!')
  }
}
