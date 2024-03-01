export interface TwilioConfig {
  sid: string
  authToken: string
  from: string
}

export interface TwilioFakedData {
  messages: string[]
  calls: string[]
}
