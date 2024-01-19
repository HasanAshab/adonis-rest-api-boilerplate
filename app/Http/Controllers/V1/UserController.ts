import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from "App/Models/User";
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService";
//import UpdateProfileRequest from "App/Http/requests/v1/user/UpdateProfileRequest";
//import ChangePasswordRequest from "App/Http/requests/v1/user/ChangePasswordRequest";
//import ChangePhoneNumberRequest from "App/Http/requests/v1/user/ChangePhoneNumberRequest";


export default class UserController {
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
  

  async profile(req: AuthenticRequest) {
    return UserProfileResource.make(req.user);
  }
  

  async updateProfile(req: UpdateProfileRequest) {
    const user = req.user;
    const profile = req.file("profile");

    Object.assign(user, req.body);
    
    if(req.body.email) {
      user.verified = false;
    }
    
    if (profile) {
      if(user.profile) {
        await user.media().withTag("profile").replaceBy(profile);
      }
      else {
        await user.media().withTag("profile").attach(profile).storeLink();
      }
    }
    
    await user.save();
    
    if(!req.body.email) 
      return "Profile updated!";
      
    await user.sendVerificationNotification("v1");
    return "Verification email sent to your new email address!";
  };
  

  async show(username: string) {
    return ShowUserResource.make(
      await User.findOneOrFail({ username }).select("-email -phoneNumber").lean()
    );
  }
  

  async delete(req: AuthenticRequest, res: Response, username: string) {
    const user = await User.findOneOrFail({ username });
    if(req.user.cannot("delete", user))
      return res.status(403).message();
    await user.delete();
    res.sendStatus(204);
  }
  

  async makeAdmin(username: string) {
    await User.updateOneOrFail({ username }, { role: "admin" });
    return "Admin role granted!";
  }
  

  async changePassword(req: ChangePasswordRequest, passwordService: PasswordService) {
    const { oldPassword, newPassword } = req.body;
    await passwordService.change(req.user, oldPassword, newPassword);
    return "Password changed!";
  };
 

  async changePhoneNumber(req: ChangePhoneNumberRequest, res: Response, twoFactorAuthService: TwoFactorAuthService) {
    const { phoneNumber, otp } = req.body;
    if(req.user.phoneNumber && req.user.phoneNumber === phoneNumber)
      return res.status(400).message("Phone number is same as old one!");
    req.user.phoneNumber = phoneNumber;
    if(!otp) {
      await twoFactorAuthService.sendOtp(req.user, "sms");
      return "6 digit OTP code sent to phone number!";
    }
    await twoFactorAuthService.verifyOtp(req.user, "sms", otp);
    await req.user.save();
    return "Phone number updated!";
  }
}

