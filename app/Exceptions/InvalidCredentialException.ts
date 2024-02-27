import ApiException from '#app/Exceptions/ApiException'

export default class InvalidCredentialException extends ApiException {
  status = 401
  message = 'Credentials not match.'
}
