/**
 * Promise 对象
 * @param {Function} executor executor 执行器
 */
function Promise (executor) {

  var _this = this
  this.state = 'pending'
  this.value = undefined
  this.reason = undefined
  this.onFulfilledFunc = []
  this.onRejectedFunc = []

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e.message)
  }

  function resolve (value) {
    if (_this.state === 'pending') {
      _this.value = value
      _this.state = 'resolved'
      _this.onFulfilledFunc.forEach(f => f(value))
    }
  }

  function reject (reason) {
    if (_this.state === 'pending') {
      _this.reason = reason
      _this.state = 'rejected'
      _this.onRejectedFunc.forEach(f => f(reason))
    }
  }


}