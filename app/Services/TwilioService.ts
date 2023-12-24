import { inject } from "@adonisjs/fold"
import Config from '@ioc:Adonis/Core/Config'
import Twilio from '@ioc:Adonis/Addons/Twilio'

export default class TwilioService {
  sendMessage(to: string, body: string) {
    return Twilio.messages.create({ 
      from: Config.get("twilio.from"),
      to,
      body
    });
  }

  makeCall(to: string, twiml: string) {
    return Twilio.calls.create({
      from: Config.get("twilio.from"),
      to, 
      twiml
    });
  }
}