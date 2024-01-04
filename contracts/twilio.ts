import type { Twilio as TwilioContract } from "twilio";

declare module '@ioc:Adonis/Addons/Twilio' {
  const Twilio: TwilioContract;
  export default Twilio;
}