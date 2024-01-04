import ApiException from 'App/Exceptions/ApiException';

export default class InvalidCredentialException extends ApiException {
	status = 401;
	message = 'Credentials not match.';
}
