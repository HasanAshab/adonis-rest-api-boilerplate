import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import { inject } from "@adonisjs/fold"
import { Mutex } from 'async-mutex'
import Cache from '@ioc:Adonis/Addons/Cache'
import { Attachment } from "@ioc:Adonis/Mongoose/Plugin/Attachable";
import User, { UserDocument } from "App/Models/User"
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService"
import InvalidCredentialException from "App/Exceptions/InvalidCredentialException"
import LoginAttemptLimitExceededException from "App/Exceptions/LoginAttemptLimitExceededException"
import OtpRequiredException from "App/Exceptions/OtpRequiredException"

@inject()
export default class AuthService {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService, private readonly mutex: Mutex) {}
  
  async register(email: string, username: string, password: string, profile?: MultipartFileContract){
    const user = new User({ email, username, password });

    if(profile) {
      //await user.media().withTag("profile").attach(profile).storeLink();
      user.profile = await Attachment.fromFile(profile);
    }

    await user.save();
    await user.createDefaultSettings();
    return user;
  }
  
  async login(email: string, password: string, otp?: string) {
    if(await this.getFailedAttempts(email) >= 4) {
      throw new LoginAttemptLimitExceededException();
    }

    const user = await User.internal().where("email").equals(email).includeHiddenFields();

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
 
  private getFailedAttemptCacheKey(email: string) {
    return `$_LOGIN_FAILED_ATTEMPTS(${email})`;
  }
  
  private async getFailedAttempts(email: string) {
    const key = this.getFailedAttemptCacheKey(email);
    await this.mutex.acquire();
    let failedAttempts = await Cache.get(key) ?? 1;
    this.mutex.release();
    return failedAttempts;
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
  
  private async checkTwoFactorAuth(user: UserDocument, otp?: string) {
    const { twoFactorAuth } = await user.settings;
    if(!twoFactorAuth.enabled) return;
    
    if(!otp) {
      throw new OtpRequiredException();
    }
    
    await this.twoFactorAuthService.verifyOtp(user, twoFactorAuth.method, otp);
    await this.incrementFailedAttempt(user.email);
  }
}