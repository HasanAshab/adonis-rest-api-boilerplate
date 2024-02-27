import ApiException from '#app/Exceptions/ApiException'

export default class PasswordChangeNotAllowedException extends ApiException {
  status = 403
  message = 'Changing password is not allowed for this account.'
}
