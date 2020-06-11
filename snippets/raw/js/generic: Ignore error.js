function ignoreError(promise) {
  return new Promise(resolve => {
    promise.then(resolve, resolve)
  })
}
