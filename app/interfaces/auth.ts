import { DeviceInfo } from '#interfaces/http/request'
import { AllyUserContract, Oauth2AccessToken } from '@adonisjs/ally/types'

export interface RegistrationData {
  email: string
  username: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
  ipAddress: string
  device: DeviceInfo
}

export interface TwoFactorChallengeVerificationOptions {
  trustThisDevice?: boolean
}

export interface TwoFactorChallengeVerificationData {
  code: string
  device: DeviceInfo
  ipAddress: string
  options?: TwoFactorChallengeVerificationOptions
}

export interface SocialAuthData extends AllyUserContract<Oauth2AccessToken> {
  username?: string
}
