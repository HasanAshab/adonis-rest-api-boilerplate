import ApiException from '#exceptions/api_exception'

export default class InvalidCredentialException extends ApiException {
  status = 401
  message = 'Credentials not match.'
}
