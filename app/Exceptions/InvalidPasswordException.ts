import ApiException from 'App/Exceptions/ApiException'

export default class InvalidPasswordException extends ApiException {
  status = 401
  message = 'Incorrect password, try again.'
}
