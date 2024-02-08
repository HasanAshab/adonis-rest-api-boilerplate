import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public boot() {
    require('./macros/model_query_builder')
    require('./macros/response')
  }
}
