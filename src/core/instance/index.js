/* 
  Vue构造函数 & 实例相关代码
  核心作用是定义Vue的构造函数 以及 定义一系列Vue原型方法
 */

import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 定义Vue构造函数
function Vue (options) {
  console.log('%c开始执行Vue构造函数，执行语句：new Vue(options);','font-size:1.5em;color:red;background-color:pink;')
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  

  // vm._init私有方法来自于下面的initMixin
  this._init(options)
  
console.log("Vue instance created")
}
console.log("Vue class created")

// 给vm扩展_init私有方法，该方法的核心是执行 vm.$mount
initMixin(Vue)

// 给vm扩展$set、$delete、$watch方法，$data、$props属性
stateMixin(Vue)

// 给vm扩展$on、$once、$off、$emit方法
eventsMixin(Vue)

// 给vm扩展_update私有方法、$forceUpdate、$destroy方法
// 其中_update私有方法负责执行src/core/vdom/下定义的patch，将VNode渲染为真实的DOM
lifecycleMixin(Vue)

// 给vm扩展$nextTick方法、_render私有方法
// 其中_render私有方法负责执行render函数，输出VNode
renderMixin(Vue)

// Mixins是在文件被import后执行
console.log("Mixins Added")

export default Vue