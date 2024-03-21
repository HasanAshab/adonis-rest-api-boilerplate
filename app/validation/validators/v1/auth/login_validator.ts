import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
    deviceId: vine.string()
  })
)

export const socialAuthTokenLoginValidator = vine.compile(
  vine.object({
    token: vine.string(),
    email: vine.string().email().optional(),
    username: vine
      .string()
      .alphaNumeric()
      .minLength(config.get('app.constraints.user.username.minLength'))
      .maxLength(config.get('app.constraints.user.username.maxLength'))
      .optional(),
  })
)
