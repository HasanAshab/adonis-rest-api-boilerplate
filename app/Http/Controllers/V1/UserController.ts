import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { bind } from '@adonisjs/route-model-binding'
import { inject } from '@adonisjs/core'
import User from "App/Models/User";
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService";
import UserPolicy from 'App/Policies/UserPolicy';
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import UpdateProfileValidator from "App/Http/Validators/V1/user/UpdateProfileValidator";
import ChangePasswordValidator from "App/Http/Validators/V1/user/ChangePasswordValidator";
import ChangePhoneNumberValidator from "App/Http/Validators/V1/user/ChangePhoneNumberValidator";


export default class UserController {
  public static readonly VERSION = 'v1';
  
  //TODO
  public async index({ request }: HttpContextContract) {
    //return ListUserResource.collection(
      //await User.where("role").equals("novice").lean().paginateCursor(req)
   // );
    const paginated = await User.withRole("novice").paginate();
    const serialized = paginated.toJSON();
    
    serialized.data = serialized.data.map(user => ({
      id: user.id,
      username: user.username,
      profile: user.profile
    }))
    
    return serialized;
  }
  
  //TODO
  async profile({ auth }) {
    return UserProfileResource.make(auth.user!);
  }
  
  public async updateProfile({ request, auth }: HttpContextContract) {
    const { profile, ...data } = await request.validate(UpdateProfileValidator);
    const user = auth.user!;

    user.merge(data);
    
    if(data.email) {
      user.verified = false;
    }
    
    if (profile) {
      user.profile = Attachment.fromFile(profile)
    }
    
    await user.save();
    
    if(data.email) {
      await user.sendVerificationMail(UserController.VERSION);
      return "Verification email sent to your new email address!";
    }
    
    return "Profile updated!";
  }
  
  //TODO
  async show(username: string) {
    return ShowUserResource.make(
      await User.findOneOrFail({ username }).select("-email -phoneNumber").lean()
    );
  }
  
  @bind()
  public async delete({ request, response, bouncer }: HttpContextContract, user: User) {
    if(await bouncer.with(UserPolicy).denies("delete", user)) {
      return response.forbidden();
    }
    await user.delete();
    response.noContent();
  }
  
  public async makeAdmin({ params }: HttpContextContract) {
    await User.query().where('id', params.id).update({ role: "admin" });
    return "Admin role granted to the user!";
  }
  
  //@inject()
  public async changePassword({ request, auth }: HttpContextContract, authService: BasicAuthService) {
    const { oldPassword, newPassword } = await request.validate(ChangePasswordValidator);
    await authService.changePassword(auth.user!, oldPassword, newPassword);
		await Mail.to(user.email).send(new PasswordChangedMail());
    return "Password changed!";
  }
 
  //@inject()
  async changePhoneNumber({ request, response, auth }: HttpContextContract, twoFactorAuthService: TwoFactorAuthService) {
    const { phoneNumber, otp } = await request.validate(ChangePhoneNumberValidator);
    const user = auth.user!;
    
    if(user.phoneNumber && user.phoneNumber === phoneNumber) {
      return response.badRequest("Phone number should not be same as old one!");
    }
    
    user.phoneNumber = phoneNumber;
    
    if(!otp) {
      await twoFactorAuthService.sendOtp(user, "sms");
      return response.accepted("6 digit OTP code sent to phone number!");
    }
    
    await twoFactorAuthService.verifyOtp(user, "sms", otp);
    await user.save();
    return "Phone number updated!";
  }
}