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

/**
 * 状态更新后执行
 * @param {Function} onFulfilled 成功状态回调
 * @param {Function} onRejected 失败状态回调
 */
Promise.prototype.then = function (onFulfilled, onRejected) {

  //  解决值得传递,如果没给任何参数就使用默认回调
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val
  onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }

  var promise2 = new Promise((resolve, reject) => {
    if (this.state === 'pending') {
      if (typeof onFulfilled === 'function') {
        this.onFulfilledFunc.push(value => {
          setTimeout(() => {
            try {
              let x = onFulfilled(value)  //  保证onFulfilled是异步执行
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      }

      if (typeof onRejected === 'function') {
        this.onRejectedFunc.push(reason => {
          setTimeout(() => {
            try {
              let x = onRejected(reason)
              resolvePromise(promise2, x, resolvePromise, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    }

    if (this.state === 'resolved') {
      if (typeof onFulfilled === 'function') {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
    }

    if (this.state === 'rejected') {
      if (typeof onRejected === 'function') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
    }

  })

  return promise2
}