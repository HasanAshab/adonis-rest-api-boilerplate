import { validator, schema } from '@ioc:Adonis/Core/Validator'
import { PasswordStrategyManager } from '@ioc:Adonis/Core/Validator/Rules/Password'
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
  async (value, [strategyName], options) => {
    const strategy = PasswordStrategyManager.get(strategyName);

    if(await strategy.validate(value)) return;
    
    return options.errorReporter.report(
      options.pointer,
      `password.${strategyName}`,
      strategy.message,
      options.arrayExpressionPointer
    );
  },
  () => ({ async: true })
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

