import type { AllyUserContract } from '@ioc:Adonis/Addons/Ally'
import User from 'App/Models/User'
import EmailRequiredException from 'App/Exceptions/Validation/EmailRequiredException'
import UsernameRequiredException from 'App/Exceptions/Validation/UsernameRequiredException'
import DuplicateEmailAndUsernameException from 'App/Exceptions/Validation/DuplicateEmailAndUsernameException'
import DuplicateUsernameException from 'App/Exceptions/Validation/DuplicateUsernameException'
import DuplicateEmailException from 'App/Exceptions/Validation/DuplicateEmailException'


export default class SocialAuthService {
  public async upsertUser(provider: string, allyUser: AllyUserContract, username?: string) {
    let isRegisteredNow = false

    const user = await User.updateOrCreate(
      {
        socialProvider: provider,
        socialId: allyUser.id,
      },
      {
        name: allyUser.name.substring(0, 35),
        socialAvatarUrl: allyUser.avatarUrl,
      }
    )
    
    if(!user.email && username) {
      if (!allyUser.email) {
        throw new EmailRequiredException()
      }

      const existingUsers = await User.query()
        .where('email', allyUser.email)
        .orWhere('username', username)
        .select('email', 'username')

      const emailExists = existingUsers.some(user => user?.email === allyUser.email)
      const usernameExists = existingUsers.some(user => user?.username === username)

      if (emailExists && usernameExists) {
        throw new DuplicateEmailAndUsernameException()
      }

      if (emailExists) {
        throw new DuplicateEmailException()
      }

      user.email = allyUser.email
      user.verified = allyUser.emailVerificationState === 'verified'
      if (!usernameExists) {
        user.username = username
      }
      await user.save()

      if (usernameExists) {
        throw new DuplicateUsernameException()
      }

      isRegisteredNow = true
    }
    
    else if(!user.email && !username) {
      if (!allyUser.email) {
        throw new EmailRequiredException()
      }

      const emailExists = await User.exists('email', allyUser.email)
        
      if (emailExists) {
        throw new DuplicateEmailException()
      }

      user.email = allyUser.email
      user.verified = allyUser.emailVerificationState === 'verified'
      await user.generateUsername(10)
      await user.save()

      if(!user.username) {
        throw new UsernameRequiredException()
      }

      isRegisteredNow = true
    }

    if (!user.username) {
      throw new UsernameRequiredException();
    }
    
    return { user, isRegisteredNow }
  }
}
