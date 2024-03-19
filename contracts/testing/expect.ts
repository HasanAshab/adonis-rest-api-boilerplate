declare module 'expect' {
  interface Matchers {
    toBeFalse(): CustomMatcherResult
    toBeTrue(): CustomMatcherResult
  }
}
