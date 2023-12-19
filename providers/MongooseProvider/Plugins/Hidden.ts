import { Schema } from "mongoose";

/**
 * Search fields that have a options `{ hide: true }` in the schema
 */
function searchHiddenFields(schema: Schema) {
  const hiddenFields: string[] = [];
  for(const field in schema.obj) {
    const fieldData = schema.obj[field];
    if(isPureObject(fieldData) && fieldData.hide) {
      hiddenFields.push(field);
    }
  }
  return hiddenFields;
}


/**
 * Plugin to exclude (deselect) hidden fields from query
 */
export default function Hidden(schema: Schema) {
  const excludeHiddenFieldsQuery = searchHiddenFields(schema).reduce((acc: Record<string, number>, field) => {
    acc[field] = 0;
    return acc;
  }, {});
  
  schema.pre(/find/, function() {
    if(!this._mongooseOptions.includeHiddenFields)
      this.select(excludeHiddenFieldsQuery);
  });
  
  schema.query.includeHiddenFields = function() {
    this._mongooseOptions.includeHiddenFields = true;
    return this;
  }
}