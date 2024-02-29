import type { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'
import { inject } from '@adonisjs/core'
import User from '#app/models/user'
import BasicAuthService from '#app/services/auth/basic_auth_service'
import Otp from '#app/services/auth/otp'
import { Attachment } from '@ioc:adonis/addons/attachment_lite'
import { 
  updateProfileValidator,
  changePasswordValidator, 
  changePhoneNumberValidator
} from '#app/http/validators/v1/user_validator'
import SamePhoneNumberException from '#app/exceptions/validation/same_phone_number_exception'
import PasswordChangedMail from '#app/mails/password_changed_mail'
import ListUserResource from '#app/http/resources/v1/user/list_user_resource'
import UserProfileResource from '#app/http/resources/v1/user/user_profile_resource'
import ShowUserResource from '#app/http/resources/v1/user/show_user_resource'


export default class UsersController {
  public async index({ request }: HttpContext) {
    return ListUserResource.collection(await User.withRole('user').paginateUsing(request))
  }

  public profile({ auth }: HttpContext) {
    return UserProfileResource.make(auth.user!)
  }

  //TODO
  //@inject()
  public async updateProfile(
    { request, auth: { user } }: HttpContext,
    authService: BasicAuthService = new BasicAuthService()
  ) {
    const { avatar, ...data } = await request.validateUsing(updateProfileValidator)
    user.merge(data)

    if (data.email) {
      user.verified = false
    }

    if (avatar) {
      user.avatar = Attachment.fromFile(avatar)
    }

    await user.save()

    if (data.email) {
      await authService.sendVerificationMail(user)
      return 'Verification email sent to your new email address!'
    }

    return 'Profile updated!'
  }

  public async show({ params }: HttpContext) {
    const user = await User.query()
      .where('username', params.username)
      .select('id', 'name', 'username', 'role')
      .firstOrFail()

    return ShowUserResource.make(user)
  }

  public async delete({ response, auth }: HttpContext) {
    await auth.user!.delete()
    response.noContent()
  }

  @bind()
  public async deleteById({ request, response, bouncer }: HttpContext, user: User) {
    if (await bouncer.with('UserPolicy').denies('delete', user)) {
      return response.forbidden()
    }
    await user.delete()
    response.noContent()
  }

  public async makeAdmin({ response, params }: HttpContext) {
    return (await User.query().whereUid(params.id).update({ role: 'admin' }))
      ? 'Admin role granted to the user.'
      : response.notFound('User not found')
  }

  //TODO
  //@inject()
  public async changePassword(
    { request, auth }: HttpContext,
    authService = new BasicAuthService()
  ) {
    const { oldPassword, newPassword } = await request.validateUsing(changePasswordValidator)
    await authService.changePassword(auth.user!, oldPassword, newPassword)
    await new PasswordChangedMail(auth.user!).sendLater()
    return 'Password changed!'
  }

  async changePhoneNumber({ request, response, auth }: HttpContext) {
    const { phoneNumber, otp } = await request.validateUsing(changePhoneNumberValidator)
    const user = auth.user!

    if (user.phoneNumber === phoneNumber) {
      throw new SamePhoneNumberException()
    }

    if (!otp) {
      await Otp.sendThroughSMS(phoneNumber)
      return response.accepted('Verification code sent to the phone number!')
    }

    await Otp.verify(otp, phoneNumber)
    
    user.phoneNumber = phoneNumber
    await user.save()
    return 'Phone number updated!'
  }
  
  async removePhoneNumber({ auth }: HttpContext) {
    auth.user!.phoneNumber = null
    await auth.user!.save()
    return 'Phone number removed!'
  }
}
