import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bind } from '@adonisjs/route-model-binding'
import { inject } from '@adonisjs/core'
import User from 'App/Models/User'
import BasicAuthService from 'App/Services/Auth/BasicAuthService'
import TwoFactorAuthService from 'App/Services/Auth/TwoFactorAuthService'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import UpdateProfileValidator from 'App/Http/Validators/V1/user/UpdateProfileValidator'
import ChangePasswordValidator from 'App/Http/Validators/V1/user/ChangePasswordValidator'
import ChangePhoneNumberValidator from 'App/Http/Validators/V1/user/ChangePhoneNumberValidator'
import ListUserResource from 'App/Http/Resources/v1/user/ListUserResource'
import UserProfileResource from 'App/Http/Resources/v1/user/UserProfileResource'
import ShowUserResource from 'App/Http/Resources/v1/user/ShowUserResource'

export default class UserController {
  public static readonly VERSION = 'v1'

  public async index({ request }: HttpContextContract) {
    return ListUserResource.collection(
      await User.withRole('user').paginateUsing(request)
    )
  }

  public async profile({ auth }: HttpContextContract) {
    return UserProfileResource.make(auth.user!)
  }
  
  //TODO
  //@inject()
  public async updateProfile(
    { request, auth: { user } }: HttpContextContract,
    authService: BasicAuthService = new BasicAuthService
  ) {
    const { avatar, ...data } = await request.validate(UpdateProfileValidator)
    user.merge(data)

    if (data.email) {
      user.verified = false
    }

    if (avatar) {
      user.avatar = Attachment.fromFile(avatar)
    }

    await user.save()

    if (data.email) {
      await authService.sendVerificationMail(user, UserController.VERSION)
      return 'Verification email sent to your new email address!'
    }

    return 'Profile updated!'
  }

  public async show({ params }: HttpContextContract) {
    const user = await User.query()
      .where('username', params.username)
      .select('id', 'name', 'username', 'role')
      .firstOrFail()

    return ShowUserResource.make(user)
  }

  public async delete({ response, auth }: HttpContextContract) {
    await auth.user!.delete()
    response.noContent()
  }
  
  @bind()
  public async deleteById({ request, response, bouncer }: HttpContextContract, user: User) {
    if (await bouncer.with('UserPolicy').denies('delete', user)) {
      return response.forbidden()
    }
    await user.delete()
    response.noContent()
  }

  public async makeAdmin({ response, params }: HttpContextContract) {
    return (await User.query().where('id', params.id).update({ role: 'admin' }))
      ? 'Admin role granted to the user.'
      : response.notFound('User not found')
  }

  //TODO
  //@inject()
  public async changePassword(
    { request, auth }: HttpContextContract,
    authService: BasicAuthService = new BasicAuthService
  ) {
    const { oldPassword, newPassword } = await request.validate(ChangePasswordValidator)
    await authService.changePassword(auth.user!, oldPassword, newPassword)
    //await Mail.to(user.email).send(new PasswordChangedMail())
    return 'Password changed!'
  }
  
  //TODO
  //@inject()
  async changePhoneNumber(
    { request, response, auth }: HttpContextContract,
    twoFactorAuthService: TwoFactorAuthService = new TwoFactorAuthService
  ) {
    const { phoneNumber, otp } = await request.validate(ChangePhoneNumberValidator)
    const user = auth.user!

    if (user.phoneNumber && user.phoneNumber === phoneNumber) {
      return response.badRequest('Phone number should not be same as old one!')
    }

    user.phoneNumber = phoneNumber

    if (!otp) {
      await twoFactorAuthService.sendOtp(user, 'sms')
      return response.accepted('6 digit OTP code sent to phone number!')
    }

    await twoFactorAuthService.verifyOtp(user, 'sms', otp)
    await user.save()
    return 'Phone number updated!'
  }
}
