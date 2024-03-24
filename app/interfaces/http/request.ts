import { IDevice } from 'ua-parser-js'

export interface DeviceInfo extends IDevice {
  id: string
}
