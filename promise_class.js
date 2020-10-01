const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

const isFunction = value => typeof value === 'function'


function resolvePromise (promise2, value, resolve, reject) {
  //  防止作为返回值的 promise 可能既调 resolve 又调用 reject情况
  let called
  //  如果循环引用则通过 reject 抛出错误
  if (value === promise2) {
    reject(new TypeError('Chaining cycle detected for promise'))
  }

  //  如果 value 处于pending,promise 需保持为等待状态直至value被执行或拒绝
  //  如果 value 处于其他状态,则用相同的值处理 Promise

  //  无论 value 是对象还是函数,只要有then方法就可以被决议
  if (value && (typeof value === 'object' || typeof value === 'function')) {
    //  以下情况都需要使用 try/catch 包裹起来
    //  因为可能存在 then 方法被定义了一个抛出错误的访问器情况
    try {

      let then = value.then
      if (typeof then === 'function') {
        //  这里为了符合 A+ 规范需要使用 call的形式绑定this指向
        this.call(value,
          //  定义如何展开这个 promise
          //  内部给then方法自定义了 onFulfilled/onRejected函数,规定处理逻辑
          //  当作为返回值的promise被决议后再决议这个 then方法生成的 promise(promise2)
          function onFulfilled (res) {
            if (called) return
            called = true
            //  递归调用 resolvePromise 直到传入的value不是一个promise对象为止
            //  传递 promise2 是为了 通过闭包保留 promise2 防止后续的循环引用
            resolvePromise(promise2, res, resolve, reject)
          },
          function onRejected (err) {
            if (called) return
            called = true
            reject(err)
          }
        )
      } else {
        //  是一个对象 但没有 then方法则直接决议
        resolve(value)
      }

    } catch (e) {
      //  报错情况需要让这个 promise2 的状态变为 reject 并且锁定防止多次更改
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(value)
  }
}

