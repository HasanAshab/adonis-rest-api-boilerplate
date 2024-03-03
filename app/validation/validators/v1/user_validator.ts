import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'


export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string()
      .optional()
      .minLength(config.get('app.constraints.user.name.minLength'))
      .maxLength(config.get('app.constraints.user.name.maxLength')) 
      .escape(),

    username: vine.string()
      .optional()
      .minLength(config.get('app.constraints.user.username.minLength'))
      .maxLength(config.get('app.constraints.user.username.maxLength'))
      .alphaNum()
      .unique('users.username'),
      
    email: vine.string()
      .optional()
      .email()
      .unique('users.email'),

    avatar: vine.file()
      .optional()
      .size(config.get('app.constraints.user.avatar.size'))
      .extnames(config.get('app.constraints.user.avatar.extnames'))
  })
)


export const changePasswordValidator = vine.compile(
  vine.object(
    oldPassword: vine.string(),
    password: vine.string()
      .password(config.get('app.constraints.user.password.strategy'))
      .maxLength(config.get('app.constraints.user.password.maxLength'))
  )
)


export const changePhoneNumberValidator = vine.compile(
  vine.object(
    phoneNumber: vine.string().mobile({ strict: true }),
    otp: vine.string().optional(),
  )
)




