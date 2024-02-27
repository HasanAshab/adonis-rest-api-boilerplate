import ApiException from '#app/Exceptions/ApiException'

export default class InvalidTokenException extends ApiException {
  status = 401
  message = 'Invalid or expired token.'
}
