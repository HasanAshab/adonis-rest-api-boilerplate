import type { AllyUserContract } from '@ioc:Adonis/Addons/Ally';
import User from 'App/Models/User';
import ValidationException from 'App/Exceptions/ValidationException';


export interface SocialLoginFallbackData {
  email?: string;
  username?: string;
}

export default class SocialAuthService {
  public async upsertUser(
    provider: string,
    allyUser: AllyUserContract,
    fallbackData: SocialLoginFallbackData = {}
  ) {
    const { email = allyUser.email, username } = fallbackData;
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
    if(!(user.email || user.username) && email) {
      const existingUser = await User.query()
        .where('email', email)
        .when(username, query => {
          query.orWhere('username', username);
        })
        .select('email', 'username')
        .first();
        
      const emailExists = existingUser?.email === email;
      const usernameExists = username && existingUser?.username === username;

      if(emailExists && usernameExists) {
        throw new ValidationException({
          'email': 'unique',
          'username': 'unique'
        });
      }

      if(emailExists) {
        throw ValidationException.field('email', 'unique');
      }
      
      user.email = email;
      user.verified = allyUser.email === email && allyUser.emailVerificationState === 'verified';
      
      if(username && !usernameExists) {
        user.username = username; 
      }
      
      else {
        await user.generateUsername(10);
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
