import { test } from '@japa/runner'
import Token from '#models/token'

/*
Run this suits:
node ace test unit --files="models/token.spec.ts"
*/
test.group('Models / Token', (group) => {
  refreshDatabase(group)
  
  test('should sign a token', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'
    const secret = 'testSecret'
    const expiresIn = '1 day'

    await Token.sign(type, key, { secret, expiresIn })
    const token = await Token.findByFields({ key, type })
    
    expect(token).not.toBeNull()
    expect(token.type).toBe(type)
    expect(token.key).toBe(key)
    expect(token.oneTime).toBeFalse()
    expect(await token.compareSecret(secret)).toBeTrue()
    expect(token.expiresAt.diffNow().as('days')).toBeLessThanOrEqual(1)
  })
  
  test('signing token should generate secret if not provided', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'
    
    const secret = await Token.sign(type, key)
    const token = await Token.findByFields({ key, type })

    expect(token).not.toBeNull()
    expect(token.type).toBe(type)
    expect(token.key).toBe(key)
    expect(token.oneTime).toBeFalse()
    expect(await token.compareSecret(secret)).toBeTrue()
  })

  test('should verify a valid token', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'

    const secret = await Token.sign(type, key)

    expect(await Token.isValid(type, key, secret)).toBeTrue()
  })

  test('should not verify an invalid token', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'
    
    await Token.sign(type, key)

    expect(await Token.isValid(type, key, 'invalidSecret')).toBeFalse()
  })
  
  test('should not verify an expired token', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'

    const secret = await Token.sign(type, key, { 
      expiresIn: '-1 day'
    })

    expect(await Token.isValid(type, key, secret)).toBeFalse()
  })
  
  test('should delete a one-time token after successful verification', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'
    const secret = await Token.sign(type, key, { 
      oneTimeOnly: true
    })
    
    await Token.isValid(type, key, secret)

    expect(await Token.exists({ type, key })).toBeFalse()
  })
 
  test('should not delete a one-time token after unsuccessful verification', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'
    await Token.sign(type, key, { 
      oneTimeOnly: true
    })
    
    await Token.isValid(type, key, 'invalidSecret')

    expect(await Token.exists({ type, key })).toBeTrue()
  })
})
