import vine from '@vinejs/vine'
import Config from '@ioc:adonis/core/config'


export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string()
      .optional()
      .minLength(Config.get('app.constraints.user.name.minLength'))
      .maxLength(Config.get('app.constraints.user.name.maxLength')) 
      .escape(),

    username: vine.string()
      .optional()
      .minLength(Config.get('app.constraints.user.username.minLength'))
      .maxLength(Config.get('app.constraints.user.username.maxLength'))
      .alphaNum(),
      .unique('users.username'),
      
    email: vine.string()
      .optional()
      .email()
      .unique('users.email'),

    avatar: vine.file()
      .optional()
      .size(Config.get('app.constraints.user.avatar.size'))
      .extnames(Config.get('app.constraints.user.avatar.extnames'))
  })
)


export const changePasswordValidator = vine.compile(
  vine.object(
    oldPassword: vine.string(),
    password: vine.string()
      .password()
      .maxLength(Config.get('app.constraints.user.password.maxLength'))
  )
)


export const changePhoneNumberValidator = vine.compile(
  vine.object(
    phoneNumber: vine.string().mobile({ strict: true }),
    otp: vine.string().optional(),
  )
)




