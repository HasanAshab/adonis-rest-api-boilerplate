import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'

export const logoutOnDevicesValidator = vine.compile(
  vine.object({
    deviceIds: vine.array(vine.string())
  })
)