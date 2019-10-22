function Promise(executor) {
let self = this
this.status = 'pending' //当前状态
this.value = undefined  //存储成功的值
this.reason = undefined //存储失败的原因
this.onResolvedCallbacks = []//存储成功的回调
this.onRejectedCallbacks = []//存储失败的回调
function resolve(value) {
  if (self.status == 'pending') {
    self.status = 'resolved'
    self.value = value
    self.onResolvedCallbacks.forEach(fn => fn());
  }
}
function reject(error) {
  if (self.status == 'pending') {
    self.status = 'rejected'
    self.reason = error
    self.onRejectedCallbacks.forEach(fn => fn())
  }
}
try {
  executor(resolve, reject)
} catch (error) {
  reject(error)
}
}
Promise.prototype.then = function (infulfilled, inrejected) {
let self = this
let promise2
infulfilled = typeof infulfilled === 'function' ? infulfilled : function (val) {
  return val
}
inrejected = typeof inrejected === 'function' ? inrejected : function (err) {
  throw err
}
if (this.status == 'resolved') {
  promise2 = new Promise(function (resolve, reject) {
    //x可能是一个promise，也可能是个普通值
    setTimeout(function () {
      try {
        let x = infulfilled(self.value)
        resolvePromise(promise2, x, resolve, reject)
      } catch (err) {
        reject(err)
      }
    });

  })
}
if (this.status == 'rejected') {

  promise2 = new Promise(function (resolve, reject) {
    //x可能是一个promise，也可能是个普通值
    setTimeout(function () {
      try {
        let x = inrejected(self.reason)
        resolvePromise(promise2, x, resolve, reject)
      } catch (err) {
        reject(err)
      }
    });
  })
}
if (this.status == 'pending') {
  promise2 = new Promise(function (resolve, reject) {
    self.onResolvedCallbacks.push(function () {
      //x可能是一个promise，也可能是个普通值
      setTimeout(function () {
        try {
          let x = infulfilled(self.value)
          resolvePromise(promise2, x, resolve, reject)
        } catch (err) {
          reject(err)
        }
      });
    })
    self.onRejectedCallbacks.push(function () {
      //x可能是一个promise，也可能是个普通值
      setTimeout(function () {
        try {
          let x = inrejected(self.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (err) {
          reject(err)
        }
      });
    })
  })
}
return promise2
}
function resolvePromise(p2, x, resolve, reject) {
if (p2 === x && x != undefined) {
  reject(new TypeError('类型错误'))
}
//可能是promise,看下对象中是否有then方法，如果有~那就是个promise
if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
  try {//为了防止出现 {then:11}这种情况,需要判断then是不是一个函数
    let then = x.then
    if (typeof then === 'function') {
      then.call(x, function (y) {
        //y 可能还是一个promise,那就再去解析，知道返回一个普通值为止
        resolvePromise(p2, y, resolve, reject)
      }, function (err) {
        reject(err)
      })
    } else {//如果then不是function 那可能是对象或常量
      resolve(x)
    }
  } catch (e) {
    reject(e)
  }
} else {//说明是一个普通值
  resolve(x)
}
}

