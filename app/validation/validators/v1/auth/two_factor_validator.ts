import vine from '@vinejs/vine'
import User from '#models/user'


export const twoFactorAccountRecoveryValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    code: vine.string(),
  })
)

export const twoFactorChallengeValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    token: vine.string(),
  })
)

export const twoFactorChallengeVerificationValidator = vine
  .withMetaData<{ user: User }>()
  .compile(
    vine.object({
      email: vine.string().email(),
      token: vine.string(),
      code: vine.string(),
      deviceId: vine.string().exists((value, field) => {
        return field.meta.user.related('loggedDevices').query().where('logged_device_id', value).exists()
      })
    })
  )
