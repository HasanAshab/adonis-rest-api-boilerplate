import type { AllyUserContract } from '@ioc:Adonis/Addons/Ally';
import User from 'App/Models/User';
import ValidationException from 'App/Exceptions/ValidationException';


export interface SocialLoginFallbackData {
  email?: string;
  username?: string;
}

export default class SocialAuthService {
  public async upsertUser(provider: string, allyUser: AllyUserContract, fallbackData: SocialLoginFallbackData) {
    fallbackData.email = fallbackData.email ?? allyUser.email;
    fallbackData.username = fallbackData.username ?? fallbackData.email?.split('@')[0];
    
    const user = await User.updateOrCreate(
      {
        socialProvider: params.provider,
        socialId: allyUser.id
      },
      {
        name: allyUser.nickName.substring(0, 35),
        socialAvatar: allyUser.avatarUrl
      }
    );
    
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
          'email': 'email already exists',
          'username': 'username already exists'
        });
      }

      if(emailExists) {
        throw new ValidationException({
          'email': 'email already exists'
        });
      }
      
      user.email = fallbackData.email;
      user.verified = allyUser.emailVerificationState === 'verified';
      
      if(!usernameExists) {
        user.username = fallbackData.username;
      }

      await user.save();
      
      if(usernameExists) {
        throw new ValidationException({
          'username': 'username already exists',
        });
      }
    }
    
    if(!user.email && !user.username) {
      throw new ValidationException({
        'email': 'email already exists',
        'username': 'username already exists'
      });
    }

    if(!user.email) {
      throw new ValidationException({
        'email': 'email already exists'
      });
    }
    
    if(!user.username) {
      throw new ValidationException({
        'username': 'username already exists',
      });
    }
    
    return user;
  }
}
