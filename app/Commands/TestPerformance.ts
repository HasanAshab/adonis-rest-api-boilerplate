// @ts-nocheck
import { Command } from "samer-artisan";
import { exec, spawn } from "child_process";
import autocannon, { Options } from "autocannon";
import DB from "DB";
import URL from "URL";
import User, { IUser } from "~/app/models/User";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

export default class TestPerformance extends Command {
  signature = "performance";
  
  private benchmarkRootPath = "docs/parts";
 /* private serverProcess = spawn('npm', ['run', 'dev'], {
    env: { ...process.env, NODE_ENV: "test" }
  });*/
  private cachedUsers: Record<string, IUser> = {};
  private startTime = Date.now();
  
  async handle(){
    const { 
      connections = 2, 
      amount, 
      workers = 0,
      stdout = true,
      version = "v1",
      key = Date.now() + ".json"
    } = this.params
    
    process.on("exit", () => {
      this.info(`Time: ${(Date.now() - this.startTime) / 1000}s`)
    })

    //this.info("starting server...");
/*
    this.serverProcess.unref();
    process.on("exit", () => {
      this.info("closing server...");
      this.serverProcess.kill();
      this.info(`Time: ${(Date.now() - this.startTime) / 1000}s`)
    })
    this.serverProcess.on('error', (err) => {
      this.error('server error:', err);
    });
    if(stdout) {
      this.serverProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
    }*/
    this.info("connecting to database...");
    await DB.connect();
    this.info("reseting database...");
    await DB.reset();
    const config: Options = {
      url: URL.resolve(),
      connections: Number(connections),
      workers: Number(workers),
      timeout: 20,
      headers: {
        "content-type": "application/json"
      }
    };
    this.info(`parsing benchmarks of ${version}...`);
    config.requests = await this.parseBenchmarks(version, Number(connections), this.params.pattern);
    if(config.requests.length === 0) {
      this.error("No benchmark matched!");
    }
    config.amount = amount ? Number(amount) : config.requests.length * Number(connections);
    this.info("load test started...");
    const instance = autocannon(config, async (err, result) => {
      const outDir = "storage/reports/performance/" + version;
      await exec("mkdir -p " + outDir);
      fs.writeFileSync(path.join(outDir, key), JSON.stringify(result, null, 2));
      this.info("clearing database...");
      await DB.reset();
      this.success("Test report saved at /storage/reports/performance");
    });
    instance.on("reqError", console.log)
    instance.on("error", console.log)
  }
  
  private async parseBenchmarks(version: string, connections: number, pattern?: string) {
    const requests = [];
    const endpointPathPair = generateEndpoints(path.join(this.benchmarkRootPath, version));
    for(const [endpoint, path] of Object.entries(endpointPathPair)){
     if(pattern && !endpoint.includes(pattern)) continue
      const benchmarkFile = await import(path);
      for(const method in benchmarkFile) {
        const doc = benchmarkFile[method];
        let context: Record<string, any> = {}; 
        const request = doc.benchmark;
        if(!request) continue;
        if(doc.auth) {
          context.user = await this.getUser(doc);
          request.headers = {
            "authorization": "Bearer " + context.user.createToken()
          }
        }
        Object.assign(context, await request.setupContext?.apply(context));
        request.method = method.toUpperCase();
        const resolvedEndpoints = [endpoint];
        if(endpoint.includes("{")){
          resolvedEndpoints.pop();
          if(!request.params) this.error(`param() method is required in benchmark ${path}`)
          const getParams = request.params.bind(context);
          if(request.params.constructor.name ===  "GeneratorFunction" || request.params.constructor.name === "AsyncGeneratorFunction") {
            const paramGenerator = getParams();
            for(let i = 0; i < connections; i++) {
              const { value: params } = await paramGenerator.next();
              resolvedEndpoints.push(this.resolveDynamicPath(endpoint, params));
            }
          }
          else resolvedEndpoints[0] = this.resolveDynamicPath(endpoint, await getParams());
        }
        let i = 0;
        const realSetupFunc = request.setupRequest?.bind(context);
        request.setupRequest = function (req: Record<string, any>) {
          const subPath = resolvedEndpoints.length > 1
            ? resolvedEndpoints[i++]
            : resolvedEndpoints[0];
          req.path = "/api/" + version + subPath;
          if(realSetupFunc)
            req = realSetupFunc(req);
          return req;
        }
        request.onResponse = (status: number, body: object) => {
          if(status > 399){
            this.info(`${request.method} -> ${endpoint} -> STATUS: ${status} \n BODY: ${body}\n`);
          }
          else console.log(`${request.method} -> ${endpoint} -> STATUS: ${status}`);
        }
        requests.push(request);
      }
    }
    return requests;
  }
  
  private async getUser(doc: Record<string, any>) {
    if(doc.cached === false)
      return await User.factory().withRole(doc.auth).create();
    if(!this.cachedUsers[doc.auth])
      this.cachedUsers[doc.auth] = await User.factory().withRole(doc.auth).create() as IUser;
    return this.cachedUsers[doc.auth];
  }
  
  private resolveDynamicPath(endpoint: string, params: Record<string, any>) {
    return endpoint.replace(/\{(\w+)\}/g, (match: string, key: string) => {
      const value = params[key];
      if(!value) this.error(`The "${key}" param is required in benchmark of endpoint ${endpoint}`);
      return value;
    });
  }
  
}