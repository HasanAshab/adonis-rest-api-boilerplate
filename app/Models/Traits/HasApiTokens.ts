import HttpContext from '@ioc:Adonis/Core/HttpContext'
import AuthManager from '@ioc:Adonis/Addons/Auth'

export default function HasApiTokens(Superclass) {
  class HasApiTokensModel extends Superclass {
    public async createToken(name = '') {
      const ctx = HttpContext.create('/', {});
      const auth = await AuthManager.getAuthForRequest(ctx);
      const config = auth.use().config.tokenProvider;
      
      const token = await auth.login(this, {
        name,
        expiresIn: config.expiresIn
      });
      
      token.toJSON = function() {
        return {
          plain: this.token,
          expires_at: this.expiresAt
        }
      }
      
      return token;
    }
  }
  
  return HasApiTokensModel;
}