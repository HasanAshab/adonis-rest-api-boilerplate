declare module '@ioc:Adonis/Addons/Twilio' {
  import type TwilioContract from 'app/providers/twilio_provider/twilio'

  const Twilio: TwilioContract
  export default Twilio

  interface TwilioConfig {
    sid: string
    authToken: string
    from: string
  }

  interface TwilioFakedData {
    messages: string[]
    calls: string[]
  }
}
