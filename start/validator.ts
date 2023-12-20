import { validator } from '@ioc:Adonis/Core/Validator'
import { string } from '@ioc:Adonis/Core/Helpers'
import { model } from 'mongoose';


validator.rule('password', 
  (value, { strength }, options) => {
    const passwordPatterns = {
      strong: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/,
      medium: /(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})/,
      weak: /(?=.{6,})/
    };
    const isValid = passwordPatterns[strength].test(value);
    if(!isValid) {
      return options.errorReporter.report(
        options.pointer,
        'password',
        'pass error msg',
        options.arrayExpressionPointer
      );
    }
  },
  (options) => ({
    compiledOptions: {
      strength: options[0] || "medium"
    }
  })
);


validator.rule('exists', 
  async (value, [Model, field], options) => {
    if(typeof Model === "string") {
      Model = model(Model);
    }
    
    const exists = await Model.exists({ [field]: value });
    if(!exists) {
      return options.errorReporter.report(
        options.pointer,
        'unique',
        'must be unique',
        options.arrayExpressionPointer
      );
    }
  },
  () => ({ async: false })
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
        'must be unique',
        options.arrayExpressionPointer
      );
    }
  },
  () => ({ async: false })
)

