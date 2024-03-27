declare module 'expect' {
  interface Matchers<R, T> {
    toBeFalse(): R
    toBeTrue(): R
  }
}
