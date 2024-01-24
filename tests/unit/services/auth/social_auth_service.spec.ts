import { test } from '@japa/runner';
import type { AllyUserContract } from '@ioc:Adonis/Addons/Ally'
import User from 'App/Models/User';
import SocialAuthService from 'App/Services/Auth/SocialAuthService';
import ValidationException from 'App/Exceptions/ValidationException';


test.group('Services/Auth/SocialAuthService', group => {
  const service = new SocialAuthService();
  
  refreshDatabase(group);

  test('should create a new user', async ({ expect }) => {
    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified'
    }
    
    const result = await service.upsertUser('google', allyUser)

    expect(result.user.email).toBe(allyUser.email)
    expect(result.user.username).toBe('test')
    expect(result.user.verified).toBe(true)
    expect(result.user.socialAvatar).toBe(allyUser.avatarUrl)
    expect(result.isRegisteredNow).toBe(true)
  })

  
  test('should update existing user', async ({ expect }) => {
    const socialProvider = 'google';

    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified'
    }
    
    const user = await User.create({
      socialId: allyUser.id,
      socialProvider,
      email: allyUser.email,
      username: 'test',
      name: 'Old Name',
      socialAvatar: 'http://example.com/old-avatar.jpg'
    })

    const result = await service.upsertUser(socialProvider, allyUser)
  
    expect(result.user.name).toBe(allyUser.name)
    expect(result.user.socialAvatar).toBe(allyUser.avatarUrl)
  })
  
  test('should not update email', async ({ expect }) => {
    const socialProvider = 'google';

    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified'
    }
    
    const user = await User.create({
      socialId: allyUser.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
    })

    const result = await service.upsertUser(socialProvider, allyUser)
  
    expect(result.user.email).toBe(user.email);
  }).pin()
  
  test('should not update user verification status when social email not match', async ({ expect }, { state, status }) => {
    const socialProvider = 'google';

    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: state
    }
    
    const user = await User.create({
      socialId: allyUser.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
      verified: status
    })

    const result = await service.upsertUser(socialProvider, allyUser)
  
    expect(result.user.verified).toBe(status);
  }).with([
    { state: 'verified', status: false },
    { state: 'verified', status: true },
    { state: 'unverified', status: false },
    { state: 'unverified', status: true },
    { state: 'unsupported', status: false },
    { state: 'unsupported', status: true },
  ]).pin()


  
  test('should throw validation exception when email not provided by the oauth provider and no fallback email given', async ({ expect }) => {
    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'unsupported'
    }
    
    try {
      await service.upsertUser('google', allyUser)
    }
    catch (error) {
      expect(error).toBeInstanceOf(ValidationException)
      expect(error.fieldsWithRule).toEqual({
        email: 'required',
        username: 'required'
      })
    }
  })
  
  test('should make verified user when email verification state is verified', async ({ expect }) => {
    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified'
    }
    
    const fallbackData = {
      email: 'test@example.com'
    }
    const result = await service.upsertUser('google', allyUser, fallbackData)

    expect(result.user.verified).toBe(true)
  })
  
  test('should not make verified user when email verification state is not verified', async ({ expect }, state) => {
    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: state
    }
    
    const result1 = await service.upsertUser('google', allyUser, fallbackData)

    expect(result.user.verified).toBe(false)
  }).with([
    'unverified',
    'unsupported'
  ]);
 
  test('should throw validation exception if email is not unique', async ({ expect }) => {
    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified'
    }
    const fallbackData = {
      email: 'test@example.com',
      username: 'testuser'
    }

    await User.create({
      email: fallbackData.email,
      username: 'anotheruser',
      password: 'secret'
    })

    try {
      await service.upsertUser('google', allyUser, fallbackData)
    } catch (error) {
      expect(error).to.be.instanceOf(ValidationException)
      expect(error.messages).to.deep.equal({ email: ['unique'] })
    }
 })

  test('should throw validation exception if username is not unique', async ({ expect }) => {
    const allyUser: Partial<AllyUserContract> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified'
    }
    const fallbackData = {
      email: 'anotheremail@example.com',
      username: 'testuser'
    }

    // Create a user first
    await User.create({
      email: 'anotheremail@example.com',
      username: fallbackData.username,
      password: 'secret'
    })

    try {
      await service.upsertUser('google', allyUser, fallbackData)
    } catch (error) {
      expect(error).to.be.instanceOf(ValidationException)
      expect(error.messages).to.deep.equal({ username: ['unique'] })
    }
 })
})

	