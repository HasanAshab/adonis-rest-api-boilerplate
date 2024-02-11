import Factory from 'App/Models/Traits/HasFactory/Factory'
import NotificationType from 'App/Models/NotificationType'

export default class NotificationTypeFactory extends Factory<NotificationType> {
  definition() {
    return {
      name: this.faker.commerce.productName(),
      groupName: this.faker.lorem.words(2),
      description: this.faker.lorem.sentence(),
    }
  }
}
