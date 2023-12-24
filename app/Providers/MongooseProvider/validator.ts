import { validator } from '@ioc:Adonis/Core/Validator'
import { model } from 'mongoose'

validator.rule('exists', 
  async (value, [Model, field], options) => {
    if(typeof Model === "string") {
      Model = model(Model);
    }
    
    const exists = await Model.exists({ [field]: value });
    if(!exists) {
      return options.errorReporter.report(
        options.pointer,
        'exists',
        `${options.field} does not exist.`,
        options.arrayExpressionPointer
      );
    }
  },
  () => ({ async: true })
)


validator.rule('unique', 
  async (value, [Model, field], options) => {
    if(typeof Model === "string") {
      Model = model(Model);
    }
    
    const exists = await Model.exists({ [field]: value });
    if(exists) {
      return options.errorReporter.report(
        options.pointer,
        'unique',
        `${options.field} has already been taken.`,
        options.arrayExpressionPointer
      );
    }
  },
  () => ({ async: true })
)