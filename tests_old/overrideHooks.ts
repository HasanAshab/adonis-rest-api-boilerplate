let setup;
global.beforeEach = function(cb) {
  setup = cb;
}

const realIt = global.it;

const runTest = function(method, summery, config, cb) {
  const wrappedCb = async () => {
    if(!cb) {
      cb = config;
      config = {};
    }
    if(typeof config.skipBeforeEach === "undefined" || !config.skipBeforeEach) {
      await setup?.(config);
    }
    await cb();
  };
  if(method) 
    realIt[method](summery, wrappedCb);
  else realIt(summery, wrappedCb);
}
global.it = (...args) => {
  runTest(undefined, ...args);
}

global.it.skip = (...args) => {
  runTest("skip", ...args);
}

global.it.only = (...args) => {
  runTest("only", ...args);
}