import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from "App/Models/User";
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService";
import UserPolicy from 'App/Policies/UserPolicy';
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import UpdateProfileValidator from "App/Http/Validators/V1/user/UpdateProfileValidator";
import ChangePasswordValidator from "App/Http/Validators/v1/user/ChangePasswordValidator";
import ChangePhoneNumberValidator from "App/Http/requests/v1/user/ChangePhoneNumberValidator";


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
  async profile(req: AuthenticRequest) {
    return UserProfileResource.make(req.user);
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
  

  public async delete({ request, response, params, bouncer }: HttpContextContract) {
    const user = await User.findByOrFail('username', params.username);
    if(await bouncer.with(UserPolicy).denies("delete", user)) {
      return response.forbidden();
    }
    await user.delete();
    response.noContent();
  }
  
  public async makeAdmin({ params }: HttpContextContract) {
    await User.query().where('username', params.username).update({ role: "admin" });
    return "Admin role granted to the user!";
  }
  
  public async changePassword({ request, auth }: HttpContextContract) {
    const { oldPassword, newPassword } = await request.validate(ChangePasswordValidator);
    await auth.user!.changePassword(oldPassword, newPassword);
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

