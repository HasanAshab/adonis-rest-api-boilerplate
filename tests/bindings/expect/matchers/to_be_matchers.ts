export function toBeTrue(received: unknown) {
  const pass = received === true
  return {
    message: () => `Expected ${received} ${pass ? 'not ' : ''}to be true`,
    pass,
  }
}

export function toBeFalse(received: unknown) {
  const pass = received === false
  return {
    message: () => `Expected ${received} ${pass ? 'not ' : ''}to be false`,
    pass,
  }
}
