import Factory from '#models/traits/has_factory/factory'
import NotificationType from '#models/notification_type'

export default class NotificationTypeFactory extends Factory<NotificationType> {
  definition() {
    return {
      name: this.faker.lorem.word(),
      groupName: this.faker.lorem.word(20),
      displayText: this.faker.commerce.productName(),
      description: this.faker.lorem.sentence(),
    }
  }
}
