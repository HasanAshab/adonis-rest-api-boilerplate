import twilioSdk from 'twilio'
import { TwilioFakedData, TwilioConfig } from '#app/interfaces/twilio'
import Assertor from '#tests/assertors/assertor'

export default class Twilio extends Assertor {
  private client: twilioSdk.Twilio
  private isFaked = false
  private faked: TwilioFakedData = {
    messages: [],
    calls: [],
  }

  constructor(private config: TwilioConfig) {
    super()
    this.config = config
    this.client = twilioSdk(config.sid, config.authToken)
  }

  fake() {
    this.isFaked = true
    this.restore()
  }

  restore() {
    this.faked = {
      messages: [],
      calls: [],
    }
  }

  async sendMessage(to: string, body: string) {
    if (this.isFaked) {
      return this.faked.messages.push(to)
    }

    await this.client.messages.create({
      from: this.config.from,
      body,
      to,
    })
  }

  async makeCall(to: string, twiml: string) {
    if (this.isFaked) {
      return this.faked.calls.push(to)
    }

    await this.client.calls.create({
      from: this.config.from,
      to,
      twiml,
    })
  }

  assertMessaged(phoneNumber: string) {
    this.assertTrue(this.faked.messages.includes(phoneNumber))
  }

  assertCalled(phoneNumber: string) {
    this.assertTrue(this.faked.calls.includes(phoneNumber))
  }
}
