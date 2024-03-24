import LoggedDevice from '#models/logged_device'

declare module '@japa/api-client' {
  interface ApiRequest {
    deviceId(id: string): this
    usingDevice(device: LoggedDevice): this
  }
  interface ApiResponse {
    assertBodyContains(subset: object): void
    assertBodyContainProperty(property: string, subset: object): void
    assertBodyHaveProperty(property: string, value?: unknown): void
    assertBodyNotHaveProperty(property: string): void
  }
}
