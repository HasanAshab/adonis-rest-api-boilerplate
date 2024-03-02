import vine from '@vinejs/vine'

export const emailVerificationValidator = vine.compile(
  vine.object({
    id: vine.number(),
    token: vine.string()
  })
)

export const resendEmailVerificationValidator = vine.compile(
  vine.object({
    email: vine.string().email()
  })
)