// import { UploadedFile } from "express-fileupload";
// import URL from "URL";
// import { singleton } from "tsyringe";
// import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService";
// import Socialite, { ExternalUser } from "Socialite";
// import Settings from "App/Models/Settings";
// import Token from "App/Models/Token";
// import InvalidOtpException from "App/Exceptions/InvalidOtpException";

import { inject } from "@adonisjs/fold"
//import Cache from '@ioc:Kaperskyguru/Adonis-Cache'
import { Mutex } from 'async-mutex';
import User, { UserDocument } from "App/Models/User";
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService";
import InvalidCredentialException from "App/Exceptions/InvalidCredentialException";
//import LoginAttemptLimitExceededException from "App/Exceptions/LoginAttemptLimitExceededException";
//import OtpRequiredException from "App/Exceptions/OtpRequiredException";

@inject()
export default class AuthService {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService, private readonly mutex: Mutex) {}
  
  async register(email: string, username: string, password: string, profile?: UploadedFile){
    const user = new User({ email, username });
    await user.setPassword(password);
    
    if(profile) {
      await user.media().withTag("profile").attach(profile).storeLink();
    }
    
    await user.save();
    await user.createDefaultSettings();
    return user;
  }
  
  async login(email: string, password: string, otp?: string) {
    await this.assertFailedAttemptLimitNotExceed(email);
    const user = await User.internal().where("email").equals(email);
    
    if(!user) {
      throw new InvalidCredentialException;
    }
    
    if (!await user.attempt(password)) {
      await this.incrementFailedAttempt(email);
      throw new InvalidCredentialException;
    }
    
    await this.checkTwoFactorAuth(user, otp);
    await this.resetFailedAttempts(email);
    return user.createToken();
  }
  
  async loginWithSocialProvider(provider: string, code: string) {
    const externalUser = await Socialite.driver(provider).user(code);
    console.log(externalUser)
    const user = await User.findOneAndUpdate(
      { [`externalId.${provider}`]: externalUser.id },
      { 
        name: externalUser.name,
        email: externalUser.email,
        verified: true,
        profile: externalUser.picture
      },
      { new: true }
    );
    if(user) {
      return URL.client(`/login/social/${provider}/success/${user.createToken()}`);
    }
    const fields = externalUser.email ? "username" : "email,username";
    const token = await this.createSocialLoginFinalStepToken(provider, externalUser);
    return URL.client(`/login/social/${provider}/final-step/${externalUser.id}/${token}?fields=${fields}`);
  }
  
  async createSocialLoginFinalStepToken(provider: string, externalUser: ExternalUser) {
    const { secret } = await Token.create({
      key: externalUser.id,
      type: provider + "Login",
      data: externalUser,
      expiresAt: Date.now() + 25920000
    });
    return secret;
  }
  
  async externalLoginFinalStep(provider: string, externalId: string, token: string, username: string, email?: string) {
    const externalUser = await Token.verify<ExternalUser>(externalId, provider + "Login", token);
    return await User.create({
      [`externalId.${provider}`]: externalUser.id,
      name: externalUser.name,
      email: externalUser.email ?? email,
      username,
      verified: true,
      profile: externalUser.picture
    });
  }

  private getFailedAttemptCacheKey(email: string) {
    return `$_LOGIN_FAILED_ATTEMPTS(${email})`;
  }
  
  private async checkTwoFactorAuth(user: UserDocument, otp?: string) {
    const { twoFactorAuth } = await user.settings;
    if(!twoFactorAuth.enabled) return;
    
    if(!otp) {
      throw new OtpRequiredException();
    }
    
    await this.twoFactorAuthService.verifyOtp(user, twoFactorAuth.method, otp);
    await this.incrementFailedAttempt(user.email);
  }
  
  private async assertFailedAttemptLimitNotExceed(email: string) {
    console.log(this)
    const key = this.getFailedAttemptCacheKey(email);
   // await this.mutex.acquire();
    let failedAttemptsCount = await Cache.get(key) ?? 0;
    this.mutex.release();
    if(failedAttemptsCount > 3)
      throw new LoginAttemptLimitExceededException();
  }
  
  private async incrementFailedAttempt(email: string) {
    const key = this.getFailedAttemptCacheKey(email);
    await this.mutex.acquire();
    await Cache.increment(key);
    this.mutex.release();
  }

  private async resetFailedAttempts(email: string) {
    const key = this.getFailedAttemptCacheKey(email);
    await Cache.delete(key);
  }
}