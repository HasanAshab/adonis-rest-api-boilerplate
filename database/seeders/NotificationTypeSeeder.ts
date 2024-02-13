import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import NotificationType from 'App/Models/NotificationType'

export default class extends BaseSeeder {
  public async run () {
    await NotificationType.createMany([
      {
        name: 'announcement',
        displayText: 'Announcements',
        groupName: 'App Updates',
        description: 'bla'.repeat(20)
      },
      {
        name: 'feature',
        displayText: 'Feature News',
        groupName: 'App Updates',
        description: 'bla'.repeat(20)
      },
      {
        name: 'liked',
        displayText: 'Liked',
        groupName: 'Community',
        description: 'bla'.repeat(20)
      }
    ])
  }
}
