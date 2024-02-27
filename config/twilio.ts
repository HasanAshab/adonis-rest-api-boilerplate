import { TwilioConfig } from '@ioc:Adonis/Addons/Twilio'
import env from '#start/env/index'

const twilioConfig: TwilioConfig = {
  sid: env.get('TWILIO_SID'),
  authToken: env.get('TWILIO_AUTH_TOKEN'),
  from: '+15005550006',
}

export default twilioConfig
