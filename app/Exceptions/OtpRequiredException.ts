import ApiException from 'App/Exceptions/ApiException';

export default class OtpRequiredException extends ApiException {
	status = 401;
	message = 'Credentials matched, otp required.';
	headers = {
		'X-2FA-CODE': 'required',
	};
}
