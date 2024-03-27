import factory from '@adonisjs/lucid/factories'
import NotificationType from '#models/notification_type'

export const NotificationTypeFactory = factory
  .define(NotificationType, async ({ faker }) => {
    return {
      name: faker.lorem.word(),
      groupName: faker.lorem.word(20),
      displayText: faker.commerce.productName(),
      description: faker.lorem.sentence()
    }
  })
  .build()