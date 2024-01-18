import type ClientContract from './Client';

declare module '@ioc:Adonis/Addons/Client' {
  const Client: ClientContract;
  export default Client;
  
  interface ClientConfig {
    baseUrl: string;
  }
}