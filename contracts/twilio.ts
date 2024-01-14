declare module '@ioc:Adonis/Addons/Twilio' {
  import type Twilio as TwilioContract from "App/Providers/TwilioProvider/Twilio";
  
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