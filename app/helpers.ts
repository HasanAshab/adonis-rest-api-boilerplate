export function sleep(seconds: number) {
  return new Promise((r) => setTimeout(r, seconds * 1000))
}

export function trace(...args: unknown[]) {
  const { stack } = new Error()
  if (!stack) throw new Error('Failed to track caller.')
  const lastCaller = stack.split('\n')[2].trim()

  console.log(...args, '\n\t', '\x1b[90m', lastCaller, '\x1b[0m', '\n')
}

export function extractFromObject<T extends object>(obj: T, props: (keyof T)[]) {
  return props.reduce((extracted: Pick<T, keyof T>, prop) => {
    extracted[prop] = obj[prop]
    return extracted
  }, {})
}

export function extract<
  T extends object | object[],
  P = T extends object ? keyof T : keyof T[number],
>(obj: T, ...props: P[]) {
  if(Array.isArray(obj)) {
    return obj.map(item => extractFromObject(item, props))
  }

  return extractFromObject(obj, props)
}
