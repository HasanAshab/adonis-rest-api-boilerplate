import { ApiRequest } from '@japa/api-client'
import { get } from 'lodash-es'
import { toJSON } from '#app/helpers'
import LoggedDevice from '#models/logged_device'


ApiRequest.macro('deviceId', function(this: ApiRequest, deviceId: string) {
  return this.header('X-DEVICE-ID', deviceId)
})

ApiRequest.macro('usingDevice', function(this: ApiRequest, device: LoggedDevice) {
  return this.deviceId(device.id)
})