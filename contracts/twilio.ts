declare module '@ioc:Adonis/Addons/Twilio' {
  import type { Twilio as TwilioContract } from "twilio";
  
  const Twilio: TwilioContract;
  export default Twilio;
}