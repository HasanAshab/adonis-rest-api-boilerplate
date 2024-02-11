import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import NotificationType from 'App/Models/NotificationType'

export default class extends BaseSeeder {
  public async run () {
    await NotificationType.createMany([
      {
        type: 'announcement',
        name: 'Announcements',
        groupName: 'App Updates',
        description: 'bla'.repeat(20)
      }
    ])
  }
}
