import Factory from '#app/Models/Traits/HasFactory/Factory'
import NotificationType from '#app/Models/NotificationType'

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