declare module '@ioc:Adonis/Addons/Twilio' {
  import type TwilioContract from "App/Providers/TwilioProvider/Twilio";
  
  const Twilio: TwilioContract;
  export default Twilio;
  
  interface TwilioConfig {
    sid: string;
	  authToken: string;
	  from: string;
  }
  
  interface TwilioFakedData {
    messages: string[];
    calls: string[];
  }
}