import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { getStatusText } from 'http-status-codes';
import { forIn, reduce } from 'lodash';

export default class AppProvider {
	constructor(protected app: ApplicationContract) {}

	private extendModelQueryBuilder() {
	  const Database = this.app.container.use('Adonis/Lucid/Database');
    const { BaseModel } = this.app.container.use('Adonis/Lucid/Orm');

    Database.ModelQueryBuilder.macro('whereEqual', function (fields: Record<string, any>) {
      for(const name in fields) {
	      this.where(name, fields[name]);
	    }
	    return this;
    });
    
    Database.ModelQueryBuilder.macro('exists', async function () {
	    return !!await this.first();
    });
    
    Database.ModelQueryBuilder.macro('except', function (modelOrId: BaseModel | number) {
	    const id = modelOrId instanceof BaseModel
  	    ? modelOrId.id
  	    : modelOrId;
	    return this.whereNot('id', id);
    });
    
    Database.ModelQueryBuilder.macro('when', function(condition: boolean, cb: QueryBuilderCallback) {
	    if(condition) {
	      cb(this);
	    }
	    return this;
    });
	
	  Database.ModelQueryBuilder.macro('getCount', async function (column = '*') {
      const isString = typeof column === 'string';
      const parse = (rawCount: string) => parseInt(BigInt(rawCount));
      
      if(isString) {
        this.select(
          Database.raw(`COUNT(${column}) as total`)
        );
      }
      else {
        forIn(column, (columnName, alias) => {
          this.select(
            Database.raw(`COUNT(${columnName}) as ${alias}`)
          );
        });
	    }
      
      const result = await this.pojo().first();
      
      if(isString) {
        return parse(result.total);
      }

      forIn(column, (columnName, alias) => {
        result[alias] = parse(
          result[alias.toLowerCase()]
        );
      });
      
      return result;
    })
    
	}

	private extendHttpResponse() {
		const Response = this.app.container.use('Adonis/Core/Response');
		const { types } = this.app.container.use('Adonis/Core/Helpers');

		Response.getter('isSuccessful', function () {
			return this.response.statusCode >= 200 && this.response.statusCode < 300;
		});

		Response.getter('standardMessage', function () {
			return getStatusText(this.response.statusCode);
		});

		Response.macro('sendOriginal', Response.prototype.send);

		Response.macro(
			'sendd',
			function (
				body: null | string | Record<string, any> | any[] = {},
				generateEtag = this.config.etag,
			) {
				const acceptsJson = this.request.headers.accept === 'application/json';
				if (acceptsJson) {
					if (types.isNull(body)) {
						body = {};
					} 
					else if (types.isString(body)) {
						body = { message: body };
					} 
					else if(body.toJSON) {
				    body = body.toJSON()
				  }
					else if (types.isArray(body)) {
						body = { data: body };
					}

					if (!body.success) {
						body.success = this.isSuccessful;
					}

					if (!body.message) {
						body.message = this.standardMessage;
					}
				}

				return this.sendOriginal(body, generateEtag);
			},
		);

		Response.macro('sendStatus', function (code: number) {
			this.status(code).send({});
			return this;
		});

		Response.macro('setHeaders', function (data: object) {
			for (const key in data) {
				this.header(key, data[key]);
			}
			return this;
		});

		Response.macro('safeHeaders', function (data: object) {
			for (const key in data) {
				this.safeHeader(key, data[key]);
			}
			return this;
		});
	}
	
	
	public boot() {
		this.extendModelQueryBuilder();
		this.extendHttpResponse();
	}
}
