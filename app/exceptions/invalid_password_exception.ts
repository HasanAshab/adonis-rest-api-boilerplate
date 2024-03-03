import ApiException from '#exceptions/api_exception'

export default class InvalidPasswordException extends ApiException {
  status = 401
  message = 'Incorrect password, try again.'
}
