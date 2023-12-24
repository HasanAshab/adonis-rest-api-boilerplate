import type { Twilio as TwilioContract } from "twilio";

declare module '@ioc:Adonis/Addons/Twilio' {
  export default Twilio: TwilioContract;
}