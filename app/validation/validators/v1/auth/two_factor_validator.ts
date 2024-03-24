import vine from '@vinejs/vine'

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

export const twoFactorChallengeVerificationValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    token: vine.string(),
    code: vine.string(),
    trustThisDevice: vine.boolean(),
  })
)
