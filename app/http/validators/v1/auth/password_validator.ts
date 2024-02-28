import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'

  
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)


export const resetPasswordValidator = vine.compile(
  vine.object({
    id: vine.number(),
    token: vine.string(),
    password: vine.string()
      .password()
      .maxLength(config.get('app.constraints.user.password.maxLength'))
  })
)