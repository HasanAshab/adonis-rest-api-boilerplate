import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique('users.email'),

    username: vine
      .string()
      .alphaNumeric({
        allowUnderscores: true,
        allowDashes: true
      })
      .minLength(config.get('app.constraints.user.username.minLength'))
      .maxLength(config.get('app.constraints.user.username.maxLength'))
      .unique('users.username'),

    password: vine
      .string()
      .password(config.get('app.constraints.user.password.strategy'))
      .maxLength(config.get('app.constraints.user.password.maxLength')),

    avatar: vine.file(config.get('app.constraints.user.avatar')).optional(),
  })
)



export const testValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique('users.email'),

    username: vine
      .string()
      .alphaNumeric({
        allowUnderscores: true,
        allowDashes: true
      })
      .minLength(config.get('app.constraints.user.username.minLength'))
      .maxLength(config.get('app.constraints.user.username.maxLength'))
      .unique('users.username'),

    password: vine
      .string()
      .password(config.get('app.constraints.user.password.strategy'))
      .maxLength(config.get('app.constraints.user.password.maxLength')),

    avatar: vine.file(config.get('app.constraints.user.avatar')).optional(),
    
    foo: vine.object({
      a: vine.object({
        x: vine.boolean(),
        y: vine.number()
      }),
      b: vine.array(vine.string()),
      c: vine.string()
    })
  })
)

