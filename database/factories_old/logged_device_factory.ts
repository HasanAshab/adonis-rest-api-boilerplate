import Factory from '#models/traits/has_factory/factory'
import LoggedDevice from '#models/logged_device'

export default class LoggedDeviceFactory extends Factory<LoggedDevice> {
  definition() {
    return {
      id: this.faker.string.uuid(),
    }
  }
}
