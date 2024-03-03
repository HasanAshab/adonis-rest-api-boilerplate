import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

const allyConfig = defineConfig({
  google: drivers.google({
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: '',
  }),
  facebook: drivers.facebook({
    clientId: env.get('FACEBOOK_CLIENT_ID'),
    clientSecret: env.get('FACEBOOK_CLIENT_SECRET'),
    callbackUrl: '',
  })
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}