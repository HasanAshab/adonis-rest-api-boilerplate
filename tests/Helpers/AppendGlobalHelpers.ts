import Database from '@ioc:Adonis/Lucid/Database'
import { join } from 'path';

globalThis.trace = function trace(...args: unknown[]) {
	const { stack } = new Error();
	if (!stack) throw new Error('Failed to track caller.');
	const lastCaller = stack.split('\n')[2].trim();

	console.log(...args, '\n\t', '\x1b[90m', lastCaller, '\x1b[0m', '\n');
};

globalThis.sleep = function sleep(seconds: number) {
	return new Promise((r) => setTimeout(r, seconds * 1000));
};


globalThis.filePath = function filePath(name: string) {
	return join(__dirname, '../../tmp/test/', name);
};


globalThis.refreshDatabase = function(group) {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  });
}

globalThis.assertWithContext = function(cb, steps = 3) {
  try {
    cb();
  }
  catch(e) {
    e.stack = e.stack.split('\n').toSpliced(4, steps).join('\n');
    throw e
  }
}
