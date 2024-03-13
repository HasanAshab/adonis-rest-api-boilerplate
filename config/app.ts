import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { Secret } from '@adonisjs/core/helpers'
import { defineConfig } from '@adonisjs/core/http'

export const name = 'Adonis-Boilerplate'

/**
 * The app key is used for encrypting cookies, generating signed URLs,
 * and by the "encryption" module.
 *
 * The encryption module will fail to decrypt data if the key is lost or
 * changed. Therefore it is recommended to keep the app key secure.
 */
export const appKey = new Secret(env.get('APP_KEY'))

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
  generateRequestId: true,
  allowMethodSpoofing: false,

  /**
   * Enabling async local storage will let you access HTTP context
   * from anywhere inside your application.
   */
  useAsyncLocalStorage: false,

  /**
   * Manage cookies configuration. The settings for the session id cookie are
   * defined inside the "config/session.ts" file.
   */
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },
})

/*
  |--------------------------------------------------------------------------
  | Application Constraints
  |--------------------------------------------------------------------------
  |
  | This section contains constraints and settings for your application.
  | You can define various constraints
  |
*/

export const constraints = {
  user: {
    name: {
      maxLength: 35
    },
    username: {
      minLength: 3,
      maxLength: 20
    },
    password: {
      maxLength: 128,
      strategy: 'standard'
    },
    avatar: {
      size: '1mb',
      extnames: ['jpg', 'png'],
    }
  },
  contact: {
    subject: {
      minLength: 5,
      maxLength: 72
    },
    message: {
      minLength: 20,
      maxLength: 300
    }
  },
  notificationType: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    name: {
      maxLength: 50
    },
    displayText: {
      maxLength: 30,
      minLength: 3
    },
    groupName: {
      maxLength: 20,
      minLength: 3
    },
    description: {
      maxLength: 200,
      minLength: 5
    }
  }
}
