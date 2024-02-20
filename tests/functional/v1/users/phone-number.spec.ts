import { test } from '@japa/runner'
import User from 'App/Models/User'
import Otp from 'App/Services/Auth/Otp'

/*
Run this suits:
node ace test functional --files="v1/users/phone-number.spec.ts"
*/

test.group('Users / Phone Number', (group) => {
  let user

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })

  test('Should update phone number with valid otp', async ({ client, expect }) => {
    const phoneNumber = '+14155552671'
    const otp = await Otp.generate(phoneNumber)

    const response = await client
      .patch('/api/v1/users/me/phone-number')
      .loginAs(user)
      .json({ phoneNumber, otp })
    await user.refresh()

    // TODO swap TwoFactorAuthService
    response.assertStatus(200)
    expect(user.phoneNumber).toBe(phoneNumber)
  })

  test("Shouldn't update phone number with invalid otp", async ({ client, expect }) => {
    const phoneNumber = '+14155552671'

    const response = await client.patch('/api/v1/users/me/phone-number').loginAs(user).json({
      phoneNumber,
      otp: '123456',
    })
    await user.refresh()

    // TODO swap TwoFactorAuthService
    response.assertStatus(401)
    expect(user.phoneNumber).not.toBe(phoneNumber)
  })

  test('Update phone number should send otp if otp code not provided', async ({
    client,
    expect,
  }) => {
    const phoneNumber = '+14155552671'
    let otpSend = false
    Otp.sendThroughSMS = () => otpSend = true

    
    const response = await client
      .patch('/api/v1/users/me/phone-number')
      .loginAs(user)
      .json({ phoneNumber })
    await user.refresh()

    response.assertStatus(202)
    expect(user.phoneNumber).not.toBe(phoneNumber)
    expect(otpSend).toBe(true)
  })
})
