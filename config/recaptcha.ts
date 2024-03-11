import env from '#start/env'
import { RecaptchaConfig } from '#interfaces/recaptcha'

const recaptchaConfig: RecaptchaConfig = {
  /*
  |--------------------------------------------------------------------------
  | Site Key
  |--------------------------------------------------------------------------
  |
  | The key for form
  |
  */
  siteKey: env.get('RECAPTCHA_SITE_KEY'),

  /*
  |--------------------------------------------------------------------------
  | Secret Key
  |--------------------------------------------------------------------------
  |
  | The shared key between your site and reCAPTCHA
  | * Don`t tell it to anyone
  |
  */
  secretKey: env.get('RECAPTCHA_SECRET_KEY'),

  /*
  |--------------------------------------------------------------------------
  | SSL (default: true)
  |--------------------------------------------------------------------------
  |
  | Optional
  |
  | Disable if you don't want to access the Google API via a secure connection
  |
  */
  ssl: true,
}
export default recaptchaConfig
