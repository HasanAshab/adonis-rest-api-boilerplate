import ApiException from 'App/Exceptions/ApiException';

export default class UsernameSetupRequiredException extends ApiException {
	status = 409;
	payload = {
	  errors: [{ 
	    field: 'username',
	    message: 'username setup required'
	  }]
	}
}
