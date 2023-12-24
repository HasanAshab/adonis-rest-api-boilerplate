import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Mutex } from 'async-mutex';

export default class LockProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
  //  this.app.container.bind()
  }
}
