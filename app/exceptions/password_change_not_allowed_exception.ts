import ApiException from '#exceptions/api_exception'

export default class PasswordChangeNotAllowedException extends ApiException {
  static status = 403
  static message = 'Changing password is not allowed for this account.'
}
