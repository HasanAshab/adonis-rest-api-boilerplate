import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'
import AuthenticatorMethod from '#services/auth/two_factor/methods/authenticator_method'
import SmsMethod from '#services/auth/two_factor/methods/sms_method'
import CallMethod from '#services/auth/two_factor/methods/call_method'
     

twoFactorMethod.register([
  AuthenticatorMethod,
  SmsMethod,
  CallMethod
])