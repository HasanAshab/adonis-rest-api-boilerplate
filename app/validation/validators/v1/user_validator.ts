import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'


export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string()
      .minLength(config.get('app.constraints.user.name.minLength'))
      .maxLength(config.get('app.constraints.user.name.maxLength')) 
      .escape()
      .optional(),

    username: vine.string()
      .minLength(config.get('app.constraints.user.username.minLength'))
      .maxLength(config.get('app.constraints.user.username.maxLength'))
      .alphaNumeric()
      .unique('users.username')
      .optional(),
      
    email: vine.string()
      .email()
      .unique('users.email')
      .optional(),

    avatar: vine.file(
      config.get('app.constraints.user.avatar')
    ).optional()
  })
)


export const changePasswordValidator = vine.compile(
  vine.object({
    oldPassword: vine.string(),
    password: vine.string()
      .password(config.get('app.constraints.user.password.strategy'))
      .maxLength(config.get('app.constraints.user.password.maxLength'))
  })
)


export const changePhoneNumberValidator = vine.compile(
  vine.object({
    phoneNumber: vine.string().mobile({ strict: true }),
    otp: vine.string().optional(),
  })
)




