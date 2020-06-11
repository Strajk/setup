const cleanup = function (results) {
  $.each(results, function () {
    this.values[1] = "xxxx -" + this.values[0]
  })
  return results
}
