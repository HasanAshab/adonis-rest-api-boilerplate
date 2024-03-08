import { TwilioConfig } from '#interfaces/twilio'
import env from '#start/env'

const twilioConfig: TwilioConfig = {
  sid: env.get('TWILIO_SID'),
  authToken: env.get('TWILIO_AUTH_TOKEN'),
  from: '+15005550006',
}

export default twilioConfig