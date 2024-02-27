import env from '#start/env/index'

export default env.rules({
  APP_NAME: env.schema.string(),
  APP_KEY: env.schema.string(),

  NODE_ENV: env.schema.enum(['development', 'test', 'production'] as const),
  PORT: env.schema.number(),

  DB_CONNECTION: env.schema.enum(['pg', 'sqlite'] as const),
  DRIVE_DISK: env.schema.enum(['local'] as const),
  HASH_DRIVER: env.schema.enum(['scrypt', 'argon', 'bcrypt', 'bcrypt-node'] as const),
  STRIPE_KEY: env.schema.string(),

  RECAPTCHA_SITE_KEY: env.schema.string(),
  RECAPTCHA_SECRET_KEY: env.schema.string(),

  TWILIO_SID: env.schema.string(),
  TWILIO_AUTH_TOKEN: env.schema.string(),

  SMTP_HOST: env.schema.string({ format: 'host' }),
  SMTP_PORT: env.schema.number(),
  SMTP_USERNAME: env.schema.string(),
  SMTP_PASSWORD: env.schema.string(),

  MAILGUN_API_KEY: env.schema.string(),
  MAILGUN_DOMAIN: env.schema.string(),

  PG_HOST: env.schema.string({ format: 'host' }),
  PG_PORT: env.schema.number(),
  PG_USER: env.schema.string(),
  PG_PASSWORD: env.schema.string.optional(),
  PG_DB_NAME: env.schema.string(),

  //REDIS_URL: Env.schema.string(),
  REDIS_CONNECTION: env.schema.enum(['local'] as const),
  REDIS_HOST: env.schema.string({ format: 'host' }),
  REDIS_PORT: env.schema.number(),
  REDIS_PASSWORD: env.schema.string.optional(),

  GOOGLE_CLIENT_ID: env.schema.string(),
  GOOGLE_CLIENT_SECRET: env.schema.string(),

  FACEBOOK_CLIENT_ID: env.schema.string(),
  FACEBOOK_CLIENT_SECRET: env.schema.string(),
})
