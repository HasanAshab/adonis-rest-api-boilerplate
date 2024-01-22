import ApiException from 'App/Exceptions/ApiException';

export default class EmailSetupRequiredException extends ApiException {
	status = 409;
	payload = {
	  errors: [{ 
	    field: 'email',
	    message: 'email setup required'
	  }]
	}
}
