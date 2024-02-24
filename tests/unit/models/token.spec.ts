import { test } from '@japa/runner'
import Token from 'App/Models/Token'
import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import InvalidTokenException from 'App/Exceptions/InvalidTokenException'


/*
Run this suits:
node ace test unit --files="models/token.spec.ts"
*/
test.group('Models / Token', (group) => {
  test('should create a token', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'
    const secret = 'testSecret'
    const expiresIn = '1 day'

    await Token.sign(type, key, { secret, expiresIn })
    
    const token = await Token.findByFields({ key, type })
    
    expect(token).not.toBeNull()
    expect(token.type).toBe(type)
    expect(token.key).toBe(key)
    expect(token.oneTime).toBeTrue()
    expect(await Hash.verify(token.secret, secret)).toBeTrue()
    expect(token.expiresAt.diffNow().as('days')).toBeLessThanOrEqual(1)
  }).pin()

  test('should verify a valid token', async ({ expect }) => {
    const type = 'testType'
    const key = 'testKey'
    const secret = 'testSecret'
    const expiresIn = '1 day'

    await Token.sign(type, key, { secret, expiresIn })

    expect(await Token.isValid(type, key, secret)).toBeTrue()
  })

  test('should not verify an invalid token', async (assert) => {
    const type = 'testType'
    const key = 'testKey'
    const secret = 'invalidSecret'

    const isValid = await Token.isValid(type, key, secret)
    assert.isFalse(isValid)
  })
  
  test('should delete a one-time token after verification', async (assert) => {
  const type = 'testType'
  const key = 'testKey'
  const secret = 'testSecret'
  const expiresIn = '1 day'

  // Create a one-time token
  await Token.sign(type, key, { secret, expiresIn, oneTimeOnly: true })

  // Verify the token
  const isValid = await Token.isValid(type, key, secret)
  assert.isTrue(isValid)

  // Try to find the token again
  const tokenAfterVerification = await Token.findByFields({ type, key })

  // Assert that the token has been deleted
  assert.isNull(tokenAfterVerification)
})

  test('should throw an exception for an invalid token', async (assert) => {
    const type = 'testType'
    const key = 'testKey'
    const secret = 'invalidSecret'

    await assert.throwsAsync(async () => {
      await Token.verify(type, key, secret)
    }, 'InvalidTokenException')
  })
})
