/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

// 通过 Object.create 方法定义一个中间对象
// 将其 __proto__ 设置为 Array.prototype
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 * 拦截原Array原型上的数组变更方法 并通知依赖更新
 */
methodsToPatch.forEach(function (method) {
  // 缓存原方法
  const original = arrayProto[method]

  // 调用Object.defineProperty
  def(arrayMethods, method, function mutator (...args) {
    // 调用原方法
    const result = original.apply(this, args)
    // 通过正在处理的响应式数据value上的__ob__属性拿到observer实例
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 将数组项也转换为响应式数据
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 通知依赖更新
    ob.dep.notify()
    return result
  })
})
