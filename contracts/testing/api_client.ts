declare module '@japa/api-client' {
  interface ApiResponse {
    assertBodyContains(subset: object): void
    assertBodyContainProperty(property: string, subset: object): void
    assertBodyHaveProperty(property: string, value?: unknown): void
    assertBodyNotHaveProperty(property: string): void
  }
}
