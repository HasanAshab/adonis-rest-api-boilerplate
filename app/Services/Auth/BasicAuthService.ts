import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import { inject } from '@adonisjs/fold'
import Config from '@ioc:Adonis/Core/Config'
//import type { loginAttemptThrottle as LoginAttemptThrottleConfig } from 'Config/auth';
import { Limiter } from '@adonisjs/limiter/build/services'
import type { Limiter as LimiterContract } from '@adonisjs/limiter/build/src/limiter'
import User, { UserDocument } from "App/Models/User"
import TwoFactorAuthService from "App/Services/Auth/TwoFactorAuthService"
import InvalidCredentialException from "App/Exceptions/InvalidCredentialException"
import LoginAttemptLimitExceededException from "App/Exceptions/LoginAttemptLimitExceededException"
import OtpRequiredException from "App/Exceptions/OtpRequiredException"


export default class BasicAuthService {
  private limiter?: LimiterContract;

  constructor(
    private readonly twoFactorAuthService = new TwoFactorAuthService,
    private loginAttemptThrottleConfig = Config.get('auth.loginAttemptThrottle')
  ) {
    if(this.loginAttemptThrottleConfig.enabled) {
      this.setupLimiter();
    }
  }
  
  protected setupLimiter() {
    const { maxFailedAttempts, duration, blockDuration } = this.loginAttemptThrottleConfig;
    this.limiter = Limiter.use({
      requests: maxFailedAttempts,
      duration: duration,
      blockDuration: blockDuration,
    });
  }
  
  public getThrottleKeyFor(email: string, ip: string) {
    return this.loginAttemptThrottleConfig.key
      .replace('{{ email }}', email)
      .replace('{{ ip }}', ip);
  }

  public async login(email: string, password: string, otp?: string, ip?: string) {
    if(this.limiter && !ip) {
      throw new Error('Argument[3] "ip" must be provided when login attempt throttle is enabled');
    }

    const throttleKey = this.getThrottleKeyFor(email, ip);

    if(await this.limiter?.isBlocked(throttleKey)) {
      throw new LoginAttemptLimitExceededException();
    }

    const user = await User.internal().where("email").equals(email).includeHiddenFields();
    if(!user) {
      throw new InvalidCredentialException;
    }

    if (!await user.attempt(password)) {
      await this.limiter?.increment(throttleKey);
      throw new InvalidCredentialException;
    }
    
    await this.checkTwoFactorAuth(user, otp);
    await this.limiter?.delete(throttleKey);
    return user.createToken();
  }
  
  private async checkTwoFactorAuth(user: UserDocument, otp?: string) {
    const { twoFactorAuth } = await user.settings;
    if(!twoFactorAuth.enabled) return;
    
    if(!otp) {
      throw new OtpRequiredException();
    }
    
    await this.twoFactorAuthService.verifyOtp(user, twoFactorAuth.method, otp);
  }
}