import User from '#app/Models/User'
import EmailRequiredException from '#app/Exceptions/Validation/EmailRequiredException'
import UsernameRequiredException from '#app/Exceptions/Validation/UsernameRequiredException'
import DuplicateEmailAndUsernameException from '#app/Exceptions/Validation/DuplicateEmailAndUsernameException'
import DuplicateUsernameException from '#app/Exceptions/Validation/DuplicateUsernameException'
import DuplicateEmailException from '#app/Exceptions/Validation/DuplicateEmailException'
import { AllyUserContract } from "@adonisjs/ally";

export interface SocialAuthData extends AllyUserContract {
  username?: string
}

export default class SocialAuthService {
  public async sync(provider: string, data: SocialAuthData) {
    let isRegisteredNow = false

    const user = await User.updateOrCreate(
      {
        socialProvider: provider,
        socialId: data.id,
      },
      {
        name: data.name.substring(0, 35),
        socialAvatarUrl: data.avatarUrl,
      }
    )

    if (!user.email && data.username) {
      if (!data.email) {
        throw new EmailRequiredException()
      }

      const existingUsers = await User.query()
        .where('email', data.email)
        .orWhere('username', data.username)
        .select('email', 'username')

      const emailExists = existingUsers.some((user) => user?.email === data.email)
      const usernameExists = existingUsers.some((user) => user?.username === data.username)

      if (emailExists && usernameExists) {
        throw new DuplicateEmailAndUsernameException()
      }

      if (emailExists) {
        throw new DuplicateEmailException()
      }

      user.email = data.email
      user.verified = data.emailVerificationState === 'verified'
      if (!usernameExists) {
        user.username = data.username
      }
      await user.save()

      if (usernameExists) {
        throw new DuplicateUsernameException()
      }

      isRegisteredNow = true
      await user.initNotificationPreference()
    } 
    else if (!user.email && !data.username) {
      if (!data.email) {
        throw new EmailRequiredException()
      }

      const emailExists = await User.exists('email', data.email)

      if (emailExists) {
        throw new DuplicateEmailException()
      }

      user.email = data.email
      user.verified = data.emailVerificationState === 'verified'
      await user.generateUsername(10)
      await user.save()

      if (!user.username) {
        throw new UsernameRequiredException()
      }

      isRegisteredNow = true
    }

    if (!user.username) {
      throw new UsernameRequiredException()
    }

    return { user, isRegisteredNow }
  }
}
