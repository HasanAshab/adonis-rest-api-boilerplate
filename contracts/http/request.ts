declare module '@adonisjs/core/http' {
  export interface Request {
    device(): DeviceInfo
  }
}
