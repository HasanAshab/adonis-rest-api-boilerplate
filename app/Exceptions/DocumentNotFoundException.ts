import ApiException from 'App/Exceptions/ApiException';

export default class DocumentNotFoundException extends ApiException {
	status = 404;
	message = this.modelName + ' Not Found.';

	constructor(public modelName = 'Resource') {
		super();
		this.modelName = modelName;
	}
}
