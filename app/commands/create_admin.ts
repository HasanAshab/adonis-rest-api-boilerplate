import { BaseCommand } from "@adonisjs/core/ace";
import { args } from "@adonisjs/core/ace";


export default class CreateAdmin extends BaseCommand {
  public static commandName = 'create:admin'
  public static description = 'Creates a admin user'
  public static settings = { loadApp: true }

  @args.string()
  declare username: string
  
  @args.string()
  declare email: string
  
  @args.string()
  declare password: string
  
  @args.string({ required: false })
  declare name?: string
  
  
  public async run() {
    const { default: User } = await import('App/Models/User')

    const admin = await User.create({
      ...this.parsed.args,
      role: 'admin',
      verified: true
    })
    await admin.initNotificationPreference()
    
    this.logger.success('Admin account created successfully!')
  }
}
