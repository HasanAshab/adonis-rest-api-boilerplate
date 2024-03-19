import vine from '@vinejs/vine'
import config from '@adonisjs/core/services/config'

export const createContactValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    subject: vine
      .string()
      .minLength(config.get('app.constraints.contact.subject.minLength'))
      .maxLength(config.get('app.constraints.contact.subject.maxLength'))
      .escape(),
    message: vine
      .string()
      .minLength(config.get('app.constraints.contact.message.minLength'))
      .maxLength(config.get('app.constraints.contact.message.maxLength'))
      .escape(),
  })
)

export const updateContactStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['opened', 'closed']),
  })
)

export const suggestContactValidator = vine.compile(
  vine.object({
    q: vine.string(),
    status: vine.enum(['opened', 'closed']).optional(),
    limit: vine.number().optional(),
  })
)

export const searchContactValidator = vine.compile(
  vine.object({
    q: vine.string(),
    status: vine.enum(['opened', 'closed']).optional(),
  })
)
