import { Command } from "samer-artisan";
import baseDoc from "~/docs/base";
import fs from "fs";
import { Request, AuthenticRequest } from "~/core/express";
import RouteServiceProvider from "~/app/providers/RouteServiceProvider";
import Router from "~/core/http/routing/Router";

interface DocEndpointParam {
  required: boolean,
  in: "header" | "body" | "param",
  name: string;
  type: string;
  format?: string;
  description?: string;
}

export default class Documentation extends Command {
  signature = "doc:generate";
  
  handle() {
    new RouteServiceProvider({} as any).registerRoutes();
    const docData = this.generateDocData();
    fs.writeFileSync(base("docs/data.json"), JSON.stringify(docData));
    this.info("Documentation data generated!")
  }
  
  
  private generateDocData() {
    for(const stack of Router.stack) {
      const subDoc: { parameters: DocEndpointParam[] } = { 
        parameters: []
      };
      const [ Controller, action ] = stack.metadata;
      const paramTypes: (typeof Request)[]  = Reflect.getMetadata("design:paramtypes", Controller.prototype, action);
      const CustomRequest = paramTypes.find(paramType => paramType.prototype instanceof Request)
      if(stack.middlewares.includes("auth")) {
        const parameter: DocEndpointParam = {
          required: true,
          in: "header",
          name: "Authorization",
          type: "string",
          format: "bearer"
        };
        const roles = stack.middlewares.find(alias => alias.startsWith("roles:"))?.split(":")[1];
        if(roles) {
          parameter.description = "Bearer token of role: " + roles;
        }
        subDoc.parameters.push(parameter);
      }
      if(CustomRequest?.rules) {
        const rules = CustomRequest.rules();
        for(const name in rules) {
          subDoc.parameters.push({
            name,
            in: "body",
            type: rules[name].type!,
            required: rules[name]._flags?.presence === "required",
          });
        }
      }   

      if(baseDoc.paths[stack.path])
        baseDoc.paths[stack.path][stack.method] = subDoc;
      else 
        baseDoc.paths[stack.path] = { [stack.method]: subDoc };
    }
    return baseDoc;
  }
}