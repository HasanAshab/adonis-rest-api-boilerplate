import BaseModel from '#models/base_model'
import { compose } from '@adonisjs/core/helpers'
import { column } from '@adonisjs/lucid/orm'
import { DeviceInfo } from '#interfaces/auth'
import HasFactory from '#models/traits/has_factory/mixin'
import LoggedDeviceFactory from '#database/factories/logged_device_factory'


export default class LoggedDevice extends compose(BaseModel, HasFactory) {
  static factoryClass = LoggedDeviceFactory
  
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: string

  @column()
  declare vendor: string | null = null

  @column()
  declare model: string

  serializeExtras() {
    return {
      lastLoggedAt: this.$extras.pivot_last_logged_at,
      ipAddress: this.$extras.pivot_ip_address,
      isTrusted: this.$extras.pivot_is_trusted,
    }
  }
  
  static sync(device: DeviceInfo) {
    return this.firstOrCreate(
      { id: device.id },
      {
        type: device.type,
        vendor: device.vendor,
        model: device.model
      }
    )
  }
}
