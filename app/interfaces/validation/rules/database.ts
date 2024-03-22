import { FieldContext } from '@vinejs/vine/types'

export type Checker = {
  (value: string, field: FieldContext): boolean | Promise<boolean>,
  (value: string): boolean | Promise<boolean>
}