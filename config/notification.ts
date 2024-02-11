/**
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import { NotificationConfig } from '@ioc:Verful/Notification'

/*
|--------------------------------------------------------------------------
| Notification Mapping
|--------------------------------------------------------------------------
|
| List of available notification channels. You must first define them
| inside the `contracts/notification.ts` file before mentioning them here.
|
*/
const notificationsConfig: NotificationConfig = {
  channel: 'app',
  channels: {
    /*
    |--------------------------------------------------------------------------
    | App channel
    |--------------------------------------------------------------------------
    |
    | Use this channel to store notifications in the database.
    |
    */
    app: {
      driver: 'database',
    },
    /*
    |--------------------------------------------------------------------------
    | Email channel
    |--------------------------------------------------------------------------
    |
    | Use this channel to send notifications via email.
    |
    */
    email: {
      driver: 'mail',
    },
  },
}

export default notificationsConfig
