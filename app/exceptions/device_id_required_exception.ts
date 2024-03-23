import ApiException from '#exceptions/api_exception'

export default class DeviceIdRequiredException extends ApiException {
  static status = 400
  static message = 'The "X-DEVICE-ID" header is required.'
}
