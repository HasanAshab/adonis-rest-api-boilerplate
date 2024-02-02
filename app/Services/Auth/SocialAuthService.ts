import type { AllyUserContract } from '@ioc:Adonis/Addons/Ally'
import User from 'App/Models/User'
import EmailAndUsernameRequiredException from 'App/Exceptions/Validation/EmailAndUsernameRequiredException'
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

    // The user is not ready
    if (!user.email || !user.username) {
      if (!allyUser.email) {
        throw new EmailRequiredException()
      }

      const existingUser = await User.query()
        .where('email', allyUser.email)
        .when(username, (query) => {
          query.orWhere('username', username)
        })
        .select('email', 'username')
        .first()

      const emailExists = existingUser?.email === allyUser.email
      const usernameExists = username && existingUser?.username === username

      if (emailExists && usernameExists) {
        throw new DuplicateEmailAndUsernameException()
      }

      if (emailExists) {
        throw new DuplicateEmailException()
      }

      user.email = allyUser.email
      user.verified = allyUser.emailVerificationState === 'verified'

      if (username && !usernameExists) {
        user.username = username
      } else {
        await user.generateUsername(10)
      }

      await user.save()

      if (usernameExists) {
        if(username) {
          throw new DuplicateUsernameException()
        }
        throw new UsernameRequiredException()
      }

      isRegisteredNow = true
    }

    // Insuring if the user have all critically required data
    this.assertAccountIsReady(user)

    return { user, isRegisteredNow }
  }

  private assertAccountIsReady(user: User) {
    if (!user.email && !user.username) {
      throw new EmailAndUsernameRequiredException()
    }

    if (!user.email) {
      throw new EmailRequiredException()
    }

    if (!user.username) {
      throw new UsernameRequiredException();
    }
  }
}
