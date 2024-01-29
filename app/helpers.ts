export function sleep(seconds: number) {
	return new Promise((r) => setTimeout(r, seconds * 1000));
};

export function trace(...args: unknown[]) {
	const { stack } = new Error();
	if (!stack) throw new Error('Failed to track caller.');
	const lastCaller = stack.split('\n')[2].trim();

	console.log(...args, '\n\t', '\x1b[90m', lastCaller, '\x1b[0m', '\n');
};

export function extractProperty<T extends Array>(array: T, ...props: (keyof T[number])[]) {
  return array.map(item => {
    return props.reduce((obj, prop) => {
      obj[prop] = item[prop];
      return obj;
    }, {})
  });
}