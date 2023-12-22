import { validator } from '@ioc:Adonis/Core/Validator'

validator.rule('slug', (value, _, options) => {
  if(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(value)) return;
    
  return options.errorReporter.report(
    options.pointer,
    'slug',
    '{{ field }} must be a valid slug',
    options.arrayExpressionPointer
  );
});

