import User from '#models/user'
import EmailRequiredException from '#exceptions/validation/email_required_exception'
import UsernameRequiredException from '#exceptions/validation/username_required_exception'
import DuplicateEmailAndUsernameException from '#exceptions/validation/duplicate_email_and_username_exception'
import DuplicateUsernameException from '#exceptions/validation/duplicate_username_exception'
import DuplicateEmailException from '#exceptions/validation/duplicate_email_exception'
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
