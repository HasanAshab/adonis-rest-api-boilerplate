import config from '@adonisjs/core/services/config'
import User from '#models/user'


export default class UsernameGenerator {
  public MAX_LENGTH = config.get('app.constraints.user.username.maxLength')
  
  public maxLength(len: number) {
    this.MAX_LENGTH = len
    return this;
  }
  
  public make(email: string) {
    return email
      .split('@')[0]
      .replace(/[&/\\#,+()$~%._@'":*?<>{}]/g, '')
      .substring(0, this.MAX_LENGTH)
  }
  
  public async makeUnique(email: string, maxAttempts: number) {
    const username = this.make(email)
    let uniqueUsername = username

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (await User.notExists('username', uniqueUsername)) {
        return username
      }

      uniqueUsername = name + attempt
      if (uniqueUsername.length > this.MAX_LENGTH) {
        const overflowedLength = uniqueUsername.length - this.MAX_LENGTH
        const lastIndex = username.length - overflowedLength
        uniqueUsername = username.substring(0, lastIndex) + attempt
      }
    }

    return null
  }
}

