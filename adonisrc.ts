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
    () => import('./app/Providers/AppProvider.js'),
    () => import('@adonisjs/core'),
    () => import('@adonisjs/redis'),
    () => import('./app/Providers/HashProvider.js'),
    () => import('@adonisjs/bouncer'),
    () => import('@adonisjs/ally'),
    () => import('./app/Providers/TwilioProvider.js'),
    () => import('./app/Providers/ValidationProvider.js'),
    () => import('adonis-recaptcha2'),
    () => import('@adonisjs/limiter'),
    () => import('./app/Providers/RouteProvider.js'),
    () => import('@adonisjs/lucid'),
    () => import('@adonisjs/auth'),
    () => import('./app/Providers/AuthProvider.js'),
    () => import('@adonisjs/attachment-lite'),
    () => import('./app/Providers/EventProvider.js'),
    () => import('@adonisjs/route-model-binding/build/providers/RmbProvider'),
    () => import('@adonisjs/mail'),
    () => import('@verful/notifications'),
    () => import('@adonisjs/view'),
    () => import('./app/Providers/ClientProvider.js')
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
