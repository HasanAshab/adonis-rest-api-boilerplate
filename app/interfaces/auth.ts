import { IDevice } from 'ua-parser-js'


export interface DeviceInfo extends IDevice {
  id: string
}

export interface RegistrationData {
  email: string
  username: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
  ip: string
  device: DeviceInfo
}


export interface SocialAuthData extends AllyUserContract<Oauth2AccessToken> {
  username?: string
}
