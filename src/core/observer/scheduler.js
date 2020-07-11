/* @flow */

/* watcher更新队列调度原理
- vue组件的watchers更新，不是立即执行的，而是会被加到调度队列中，在**nextTick**后执行。
- 将watcher添加到队列中之前，会根据其id来做唯一标识，避免重复
- 清空队列前，要根据watcher的id进行升序排序，原因是：
    1. 确保更新组件的顺序是从父到子。(因为父组件watcher总是先于子组件watcher创建)
    2. 组件的user watcher 在 render watcher之前执行(因为user watcher总是先于render watcher创建)
    3. 如果一个组件在父组件的watcher执行过程中被销毁，可以跳过这个组件的watcher
- 清空队列的过程中，如果有新的watcher更新任务，会根据其id大小，被拼接到正在更新的队列，以便于watcher接下来可以被立即执行而不是等到下一个nextTick
- 状态恢复：当队列的任务都执行完毕后，会将相关变量都恢复初始值：清空queue，将flushing、waiting标志重置为false
 */

import type Watcher from './watcher'
import config from '../config'
import { callHook, activateChildComponent } from '../instance/lifecycle'

import {
  warn,
  nextTick,
  devtools
} from '../util/index'

export const MAX_UPDATE_COUNT = 100 // 最大执行任务数量，用于限制最大任务数量，避免死循环

const queue: Array<Watcher> = []  // watcher队列
const activatedChildren: Array<Component> = []
let has: { [key: number]: ?true } = {}  // 用于跳过重复的watcher更新任务（根据watcher的id来做标识
let circular: { [key: number]: number } = {}  // 用于限制最大任务数量，避免死循环
let waiting = false // 用于标识当前正在执行任务队列 或者 正在等待nextTick，需要等待，
let flushing = false  // 用于标识当前正在执行任务队列，queue不可更改
let index = 0 // 当前正在执行的 watcher 在队列中的索引

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  // console.error('flushSchedulerQueue被调用，watcher队列任务 开始“同步”执行')
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  
  // 清空队列之前排序，为了确保:
  //  1。更新组件的顺序是从父到子。(因为父组件总是先于子组件创建)
  //  2。组件的user watcher 在 render watcher之前执行(因为user watcher总是先于render watcher创建)
  //  3。如果一个组件在父组件的watcher执行过程中被销毁，可以跳过这个组件的watcher
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 不要将队列的长度缓存起来，因为在清空队列的过程中，可能会有新的watcher被加进来 
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  // 在重置状态之前 备份已发布队列
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  // console.error('flushSchedulerQueue执行结束')
  resetSchedulerState()

  // call component updated and activated hooks
  // 触发组件的updated and activated钩子
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}

function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
export function queueActivatedComponent (vm: Component) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false
  activatedChildren.push(vm)
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 * 将watcher加入队列中
 * 重复的watcher id的任务会被跳过，除非队列已经被清空
 */
export function queueWatcher (watcher: Watcher) {
  debugger
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    // console.error('watcher：'+id+'被触发，立即被添加到 Scheduler Queues 队列')
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // 如果正在执行任务队列，将当前的watcher根据其id大小，拼接到队列中，以保证watcher接下来可以被立即执行
      let i = queue.length - 1  
      // i:队列末尾
      // index：当前正在执行的 watcher 在队列中的索引
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      // 在nextTick后执行watcher队列
      nextTick(flushSchedulerQueue)
    }
  }
}
