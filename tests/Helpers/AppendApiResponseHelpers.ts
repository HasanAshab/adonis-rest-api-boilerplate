import { ApiRequest } from '@japa/api-client';

ApiRequest.macro('fields', function (data: object) {
	for (const fieldName in data) {
		this.field(fieldName, data[fieldName]);
	}
	return this;
});
