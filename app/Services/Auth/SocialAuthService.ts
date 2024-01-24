import type { AllyUserContract } from '@ioc:Adonis/Addons/Ally';
import User from 'App/Models/User';
import ValidationException from 'App/Exceptions/ValidationException';


export interface SocialLoginFallbackData {
  email?: string;
  username?: string;
}

export default class SocialAuthService {
  public async upsertUser(provider: string, allyUser: AllyUserContract, fallbackData: SocialLoginFallbackData = {}) {
    this.normalizeFallbackData(fallbackData, allyUser);
    let isRegisteredNow = false;

    const user = await User.updateOrCreate(
      {
        socialProvider: provider,
        socialId: allyUser.id
      },
      {
        name: allyUser.name.substring(0, 35),
        socialAvatar: allyUser.avatarUrl
      }
    );
    
    // Merge fallback data with the user
    if(!(user.email || user.username) && fallbackData.email) {
      const existingUser = await User.query()
        .where('email', fallbackData.email)
        .orWhere('username', fallbackData.username)
        .select('email', 'username')
        .first();
        
      const emailExists = existingUser?.email === fallbackData.email;
      const usernameExists = existingUser?.username === fallbackData.username; 
      
      if(emailExists && usernameExists) {
        throw new ValidationException({
          'email': 'unique',
          'username': 'unique'
        });
      }

      if(emailExists) {
        throw ValidationException.field('email', 'unique');
      }
      
      user.email = fallbackData.email;
      user.verified = allyUser.email === fallbackData.email && allyUser.emailVerificationState === 'verified';
      
      if(!usernameExists) {
        user.username = fallbackData.username; 
      }
      
      else {
        await user.generateUsername();
      }

      await user.save();
      
      if(usernameExists) {
        throw ValidationException.field('username', 'unique');
      }
      
      isRegisteredNow = true;
    }
    
    // Insuring if the user have all critical data
    this.assertAccountIsReady(user);
    
    return { user, isRegisteredNow };
  }
  
  private normalizeFallbackData(fallbackData: SocialLoginFallbackData, allyUser: AllyUserContract) {
    fallbackData.email = fallbackData.email ?? allyUser.email;
    fallbackData.username = fallbackData.username ?? fallbackData.email?.split('@')[0];
    return fallbackData;
  }
  
  private assertAccountIsReady(user: User) {
    if(!user.email && !user.username) {
      throw new ValidationException({
        'email': 'required',
        'username': 'required'
      });
    }

    if(!user.email) {
      throw ValidationException.field('email', 'required');
    }
    
    if(!user.username) {
      throw ValidationException.field('username', 'required');
    }
  }
}
