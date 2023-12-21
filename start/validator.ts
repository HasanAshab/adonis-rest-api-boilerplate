import { validator, schema } from '@ioc:Adonis/Core/Validator'
import { string } from '@ioc:Adonis/Core/Helpers'
import { model } from 'mongoose';

validator.rule('slug', (value, _, options) => {
  if(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(value)) return;
    
  return options.errorReporter.report(
    options.pointer,
    'slug',
    '{{ field }} must be a valid slug',
    options.arrayExpressionPointer
  );
});

validator.rule('password', 
  (value, { strength }, options) => {
    const passwordPatterns = {
      strong: {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
        message: 'must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character (@ $ ! % * ? &)',
      },
      medium: {
        pattern: /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/,
        message: 'must be at least 6 characters long and include both letters and numbers',
      },
      weak: {
        pattern: /^.{6,}$/,
        message: 'must be at least 6 characters long',
      }
    };
    
    const { pattern, message } = passwordPatterns[strength]
    
    if(!pattern.test(value)) {
      return options.errorReporter.report(
        options.pointer,
        `password.${strength}`,
        message,
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
        'exists',
        '{{ field }} does not exist in the database.',
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
        '{{ field }} has already been taken.',
        options.arrayExpressionPointer
      );
    }
  },
  () => ({ async: false })
)

