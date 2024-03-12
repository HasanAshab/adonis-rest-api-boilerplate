import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'


export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique('users.email'),
    
    username: vine.string()
      .alphaNum()
      .minLength(config.get('app.constraints.user.username.minLength'))
      .maxLength(config.get('app.constraints.user.username.maxLength'))
      .unique('users.username'),

    password: vine.string()
      .password(config.get('app.constraints.user.password.strategy'))
      .maxLength(config.get('app.constraints.user.password.maxLength')),

    avatar: vine.file()
      .optional()
      .size(config.get('app.constraints.user.avatar.size'))
      .extnames(config.get('app.constraints.user.avatar.extnames'))
  })
)
