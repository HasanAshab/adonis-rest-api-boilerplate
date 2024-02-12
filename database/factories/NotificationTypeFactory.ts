import Factory from 'App/Models/Traits/HasFactory/Factory'
import NotificationType from 'App/Models/NotificationType'

export default class NotificationTypeFactory extends Factory<NotificationType> {
  definition() {
    return {
      type: this.faker.lorem.word(),
      name: this.faker.commerce.productName(),
      groupName: this.faker.lorem.word(20),
      description: this.faker.lorem.sentence(),
    }
  }
}
