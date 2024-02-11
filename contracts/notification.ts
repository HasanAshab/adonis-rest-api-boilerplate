/**
 * Feel free to let us know via PR, if you find something broken in this
 * file.
 */

declare module '@ioc:Verful/Notification' {

  /*
  |--------------------------------------------------------------------------
  | Channels
  |--------------------------------------------------------------------------
  |
  | The channels are used to send the notifications users. The Notification
  | module comes pre-bundled with two channels that are `Mail` and `Database`.
  |
  | You can also create and register your own custom providers.
  |
  */
  interface NotificationChannelsList {
    /*
    |--------------------------------------------------------------------------
    | Database Channel
    |--------------------------------------------------------------------------
    */
    database: NotificationChannels['database']

    /*
    |--------------------------------------------------------------------------
    | Mail Channel
    |--------------------------------------------------------------------------
    */
    mail: NotificationChannels['mail']

  }
}
