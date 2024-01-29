import { ApiResponse } from '@japa/api-client'

ApiResponse.macro('assertBodyHaveProperty', function (property: string) {
  this.ensureHasAssert(); 
  this.assert.property(this.body(), property);
})

ApiResponse.macro('assertBodyNotHaveProperty', function (property: string) {
  this.ensureHasAssert(); 
  this.assert.notProperty(this.body(), property);
})
