import { defineConfig } from "@adonisjs/core/app";

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  |
  | List of ace commands to register from packages. The application commands
  | will be scanned automatically from the "./commands" directory.
  |
  */
  commands: [() => import('./app/Commands'), () => import('@adonisjs/core/commands'), () => import('@adonisjs/bouncer/build/commands'), () => import('@adonisjs/lucid/commands'), () => import('@adonisjs/mail/commands'), () => import('@verful/notifications/build/commands')],
  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  |
  | List of modules to import before starting the application.
  |
  */
  preloads: [
    () => import('./start/kernel.js'),
    () => import('./start/bouncer.js'),
    () => import('./start/limiter.js'),
    () => import('./start/client.js'),
    {
      file: () => import('./start/response'),
      environment: ["web", "test"],
    },
    () => import('./start/database.js'),
    {
      file: () => import('./start/validator'),
      environment: ["web", "test"],
    },
    {
      file: () => import('./start/routes'),
      environment: ["web", "test"],
    }
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
    () => import('#providers/app_provider'),
    () => import('@adonisjs/core'),
    () => import('@adonisjs/redis'),
    () => import('#providers/hash_provider'),
    () => import('@adonisjs/bouncer'),
    () => import('@adonisjs/ally'),
    () => import('#providers/twilio_provider'),
    () => import('#providers/validation_provider'),
    () => import('@adonisjs/limiter'),
    () => import('#providers/route_provider'),
    () => import('@adonisjs/lucid'),
    () => import('@adonisjs/auth'),
    () => import('#providers/auth_provider'),
    () => import('#providers/event_provider'),
    () => import('@adonisjs/mail'),
    () => import('@adonisjs/view'),
    () => import('#providers/client_provider')
  ],
  metaFiles: [
    {
      "pattern": "resources/views/**/*.edge",
      "reloadServer": false
    }
  ],
  directories: {
    "providers": "app/Providers"
  },
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
    "suites": [
      {
        "name": "functional",
        "files": [
          "tests/functional/**/*.spec(.ts|.js)"
        ],
        "timeout": 60000
      },
      {
        "name": "unit",
        "files": [
          "tests/unit/**/*.spec(.ts|.js)"
        ],
        "timeout": 60000
      }
    ]
  }
});
