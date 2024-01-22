import ApiException from 'App/Exceptions/ApiException';

export default class EmailAndUsernameSetupRequiredException extends ApiException {
	status = 409;
	payload = {
	  errors: [
	    { 
	      field: 'email',
	      message: 'email setup required'
	    },
	    { 
	      field: 'username',
	      message: 'username setup required'
	    }
	  ]
	}
}
