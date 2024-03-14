import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  directories: {
    commands: 'app/commands',
    providers: 'app/providers',
    httpControllers: 'app/http/controllers',
    middleware: 'app/http/middleware',
    validators: 'app/validation/validators'
  },
  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  |
  | List of ace commands to register from packages. The application commands
  | will be scanned automatically from the "./commands" directory.
  |
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
    () => import('@adonisjs/mail/commands')
  ],

  /*
  |--------------------------------------------------------------------------
  | Service providers
  |--------------------------------------------------------------------------
  |
  | List of service providers to import and register when booting the
  | application
  |
  */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/vinejs_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/ally/ally_provider'),
    () => import('@adonisjs/limiter/limiter_provider'),
    () => import('@adonisjs/mail/mail_provider'),
    () => import('@adonisjs/redis/redis_provider'),
    () => import('#providers/app_provider'),
    () => import('#providers/route_provider'),
    () => import('#providers/twilio_provider'),
    () => import('#providers/validation_provider'),
    () => import('#providers/client_provider'),
    () => import('@adonisjs/auth/auth_provider'),
    () => import('#providers/recaptcha_provider'),
    () => import('@adonisjs/core/providers/edge_provider')
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  |
  | List of modules to import before starting the application.
  |
  */
  preloads: [
    () => import('#start/routes'),
    () => import('#start/kernel'),
    () => import('#start/client'),
    () => import('#start/limiter'),
    {
      file: () => import('#start/response'),
      environment: ["web", "test"],
    },
    () => import('#start/database'),
    {
      file: () => import('#start/validator'),
      environment: ["web", "test"],
    },
    {
      file: () => import('#start/routes'),
      environment: ["web", "test"],
    },
    {
      file: () => import('#start/auth'),
      environment: ["web", "test"],
    },
    () => import('#start/events')
  ],

  /*
  |--------------------------------------------------------------------------
  | Tests
  |--------------------------------------------------------------------------
  |
  | List of test suites to organize tests by their type. Feel free to remove
  | and add additional suites.
  |
  */
  tests: {
    suites: [
      {
        files: ['tests/unit/**/*.spec(.ts|.js)'],
        name: 'unit',
        timeout: 2000,
      },
      {
        files: ['tests/functional/**/*.spec(.ts|.js)'],
        name: 'functional',
        timeout: 30000,
      },
    ],
    forceExit: false,
  },
  metaFiles: [{
    pattern: 'resources/views/**/*.edge',
    reloadServer: false,
  }]
})
