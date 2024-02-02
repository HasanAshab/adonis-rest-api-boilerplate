import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  APP_NAME: Env.schema.string(),
  APP_KEY: Env.schema.string(),

  NODE_ENV: Env.schema.enum(['development', 'test', 'production'] as const),
  PORT: Env.schema.number(),

  DB_CONNECTION: Env.schema.enum(['pg', 'sqlite'] as const),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
  HASH_DRIVER: Env.schema.enum(['scrypt', 'argon', 'bcrypt', 'bcrypt-node'] as const),
  STRIPE_KEY: Env.schema.string(),

  RECAPTCHA_SITE_KEY: Env.schema.string(),
  RECAPTCHA_SECRET_KEY: Env.schema.string(),

  TWILIO_SID: Env.schema.string(),
  TWILIO_AUTH_TOKEN: Env.schema.string(),

  SMTP_HOST: Env.schema.string({ format: 'host' }),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),

  MAILGUN_API_KEY: Env.schema.string(),
  MAILGUN_DOMAIN: Env.schema.string(),

  PG_HOST: Env.schema.string({ format: 'host' }),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string(),

  //REDIS_URL: Env.schema.string(),
  REDIS_CONNECTION: Env.schema.enum(['local'] as const),
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  GOOGLE_CLIENT_ID: Env.schema.string(),
  GOOGLE_CLIENT_SECRET: Env.schema.string(),

  FACEBOOK_CLIENT_ID: Env.schema.string(),
  FACEBOOK_CLIENT_SECRET: Env.schema.string(),
})
