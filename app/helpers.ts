import { DateTime } from 'luxon'
import { clone } from 'lodash-es'
import string from '@adonisjs/core/helpers/string'
import { importDefault as getDefaultFromImport } from '@poppinss/utils'

export function importDefault<T = any>(path: string): T {
  return getDefaultFromImport(() => import(path))
}

export function sleep(seconds: number) {
  return new Promise((r) => setTimeout(r, seconds * 1000))
}

export function trace(...args: unknown[]) {
  const { stack } = new Error()
  if (!stack) throw new Error('Failed to track caller.')
  const lastCaller = stack.split('\n')[2].trim()

  console.log(...args, '\n\t', '\x1b[90m', lastCaller, '\x1b[0m', '\n')
}

export function extractFromObject<T extends object>(obj: T, props: (keyof T)[]) {
  return props.reduce((extracted: Pick<T, keyof T>, prop) => {
    extracted[prop] = obj[prop]
    return extracted
  }, {})
}

export function extract<
  T extends object | object[],
  P = T extends object ? keyof T : keyof T[number],
>(obj: T, ...props: P[]) {
  if (Array.isArray(obj)) {
    return obj.map((item) => extractFromObject(item, props))
  }

  return extractFromObject(obj, props)
}

export function except<T extends any[]>(arr: T, ...values: T[number][]) {
  return clone(arr).filter((value) => !values.includes(value))
}

export function toJSON(obj: object) {
  return JSON.parse(JSON.stringify(obj))
}

export function stringToLuxonDate(timeStr: string) {
  return DateTime.local().plus(string.milliseconds.parse(timeStr))
}
