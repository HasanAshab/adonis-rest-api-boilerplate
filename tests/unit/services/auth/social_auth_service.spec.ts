import { test } from '@japa/runner'
import User from 'App/Models/User'
import SocialAuthService, { SocialAuthData } from 'App/Services/Auth/SocialAuthService'
import EmailRequiredException from 'App/Exceptions/Validation/EmailRequiredException'
import UsernameRequiredException from 'App/Exceptions/Validation/UsernameRequiredException'
import DuplicateEmailAndUsernameException from 'App/Exceptions/Validation/DuplicateEmailAndUsernameException'
import DuplicateUsernameException from 'App/Exceptions/Validation/DuplicateUsernameException'
import DuplicateEmailException from 'App/Exceptions/Validation/DuplicateEmailException'

/*
Run this suits:
node ace test unit --files="services/auth/social_auth_service.spec.ts"
*/
test.group('Services/Auth/SocialAuthService', (group) => {
  const service = new SocialAuthService()

  refreshDatabase(group)

  //Create
  test('should create a new user', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result = await service.upsertUser('google', data)

    expect(result.user.email).toBe(data.email)
    expect(result.user.username).toBe('test')
    expect(result.user.verified).toBeTrue()
    expect(result.user.socialAvatarUrl).toBe(data.avatarUrl)
    expect(result.isRegisteredNow).toBeTrue()
  })

  test(
    'should create user with verification status "{status}" when email verification state is {state}'
  )
    .with([
      { state: 'verified', status: true },
      { state: 'unverified', status: false },
      { state: 'unsupported', status: false },
    ])
    .run(async ({ expect }, { state, status }) => {
      const data: Partial<SocialAuthData> = {
        id: '1',
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.jpg',
        email: 'test@example.com',
        emailVerificationState: state,
      }

      const result = await service.upsertUser('google', data)

      expect(result.user.verified).toBe(status)
    })

  test('should generate username from email', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result = await service.upsertUser('google', data)

    expect(result.user.username).toBe('test')
  })

  //Update
  test('should update name and avatar', async ({ expect }) => {
    const socialProvider = 'google'

    const data: Partial<SocialAuthData> = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    }

    const user = await User.create({
      socialId: data.id,
      socialProvider,
      email: data.email,
      username: 'test',
      name: 'Old Name',
      socialAvatarUrl: 'http://example.com/old-avatar.jpg',
    })

    const result = await service.upsertUser(socialProvider, data)

    expect(result.user.name).toBe(data.name)
    expect(result.user.socialAvatarUrl).toBe(data.avatarUrl)
  })

  test('should not update email', async ({ expect }) => {
    const socialProvider = 'google'

    const data: Partial<SocialAuthData> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    }

    const user = await User.create({
      socialId: data.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
    })

    const result = await service.upsertUser(socialProvider, data)

    expect(result.user.email).toBe(user.email)
  })

  test('should not update username', async ({ expect }) => {
    const socialProvider = 'google'
    const data: Partial<SocialAuthData> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    }

    const user = await User.create({
      socialId: data.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
    })

    const result = await service.upsertUser(socialProvider, data, 'test12')

    expect(result.user.username).toBe(user.username)
  })

  test('should not update username based on the new email provided by oauth', async ({
    expect,
  }) => {
    const socialProvider = 'google'
    const data: Partial<SocialAuthData> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    }

    const user = await User.create({
      socialId: data.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
    })

    const result = await service.upsertUser(socialProvider, data)

    expect(result.user.username).toBe(user.username)
  })

  test(
    'should update user verification status to {status} when oauth provided email is same and email verification state is {state}'
  )
    .with([
      { state: 'verified', status: true },
      { state: 'unverified', status: false },
      { state: 'unsupported', status: false },
    ])
    .run(async ({ expect }, { state, status }) => {
      const socialProvider = 'google'

      const data: Partial<SocialAuthData> = {
        id: '1',
        email: 'test.new@example.com',
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.jpg',
        emailVerificationState: state,
      }

      const user = await User.create({
        socialId: data.id,
        socialProvider,
        email: 'test@example.com',
        username: 'test',
        verified: status,
      })

      const result = await service.upsertUser(socialProvider, data)

      expect(result.user.verified).toBe(status)
    })

  test(
    'should not update user verification status from {status} when social email not match and email verification state is {state}'
  )
    .with([
      { state: 'verified', status: false },
      { state: 'verified', status: true },
      { state: 'unverified', status: false },
      { state: 'unverified', status: true },
      { state: 'unsupported', status: false },
      { state: 'unsupported', status: true },
    ])
    .run(async ({ expect }, { state, status }) => {
      const socialProvider = 'google'

      const data: Partial<SocialAuthData> = {
        id: '1',
        email: 'test.new@example.com',
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.jpg',
        emailVerificationState: state,
      }

      const user = await User.create({
        socialId: data.id,
        socialProvider,
        email: 'test@example.com',
        username: 'test',
        verified: status,
      })

      const result = await service.upsertUser(socialProvider, data)

      expect(result.user.verified).toBe(status)
    })

  // Registered Flag
  test('should flag registered when email provided by oauth and unique username genrated successfully', async ({
    expect,
  }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result = await service.upsertUser('google', data)

    expect(result.isRegisteredNow).toBeTrue()
  })

  test('should flag registered for first time only', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result1 = await service.upsertUser('google', data)
    const result2 = await service.upsertUser('google', data)

    expect(result1.isRegisteredNow).toBeTrue()
    expect(result2.isRegisteredNow).toBeFalse()
  })

  //Validation Exception
  test('should throw validation exception when email not provided by the oauth', async ({
    expect,
    assert,
  }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'unsupported',
    }
    const result = service.upsertUser('google', data, 'test')

    await expect(result).rejects.toThrow(EmailRequiredException)
  })

  test('should throw validation exception if email is not unique', async ({ expect }) => {
    const email = 'test@example.com'
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email,
      emailVerificationState: 'verified',
    }

    await User.create({ email })
    const result = service.upsertUser('google', data)

    await expect(result).rejects.toThrow(DuplicateEmailException)
  })

  test('should throw validation exception if user have a email and username not provided', async ({
    expect,
  }) => {
    const socialProvider = 'google'
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
    }

    await User.create({
      email: 'test@gmail.com',
      socialId: data.id,
      socialProvider,
    })

    const result = service.upsertUser(socialProvider, data)

    await expect(result).rejects.toThrow(UsernameRequiredException)
  })

  test('should throw validation exception if failed to generate unique username', async ({
    expect,
  }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }
    //todo
    User.prototype.generateUsername = () => null
    const result = service.upsertUser('google', data)

    await expect(result).rejects.toThrow(UsernameRequiredException)
  })

  test('should throw validation exception if username is not unique', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerificationState: 'verified',
      username: 'test',
    }

    await User.create({
      username: data.username,
    })
    const result = service.upsertUser('google', data)

    await expect(result).rejects.toThrow(DuplicateUsernameException)
  })

  test('should throw validation exception if email and username is not unique', async ({
    expect,
  }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
      username: 'test',
    }

    await User.create({
      email: data.email,
      username: data.username,
    })

    const result = service.upsertUser('google', data)

    await expect(result).rejects.toThrow(DuplicateEmailAndUsernameException)
  })
})
