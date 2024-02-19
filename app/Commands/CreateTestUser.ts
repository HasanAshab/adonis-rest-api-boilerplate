import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class CreateTestUser extends BaseCommand {
  public static commandName = 'create:user'
  public static description = 'Creates a user for testing purpose'
  public static settings = { loadApp: true }

  async run() {
    const { default: User } = await import('App/Models/User')
    const user = await User.factory().create()
    const { token } = await user.createToken()
    
    this.logger.info('User data: ')
    console.log(user.serialize(), '\n\n')
    this.logger.success('Token: ' + token)
  }
}
