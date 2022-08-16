import { isObject } from '@vue/shared';
import { activeEffect } from './effect';

const enum TrackType {
  GET = 'get',
  SET = 'set'
}
// 用于 存储 数据的 依赖关系
const targetMap = new WeakMap<object, Map<string, Set<any>>>();

function track(target: object, trackType: TrackType, key: string) {
  if(!targetMap.has(target)) {
    targetMap.set(target, new Map())
  }
  const depMap = targetMap.get(target) as Map<string, Set<any>>

  if(!depMap.has(key)) {
    depMap.set(key, new Set())
  }

  const deps = depMap.get(key) as Set<any> 

  deps.add(activeEffect)
}

function triggerEvents(target: object, trackType: TrackType, key: string, value: any) {
  const deps = targetMap.get(target)?.get(key)

  deps?.forEach((dep) => {
    dep.run()
  })
}

// 通过 Proxy  Reflect 数据劫持
export function reactive(target: any) {
  if(!isObject(target)) return target

  return new Proxy(target, {
    get(target, key: string, receiver): any {
      // 直接通过  target.value 不能触发 target 内部的 get 数据请求
      /**
       * {
       *    name: 11,
       *    // 直接通过 target.value 无法触发 this.name
       *    get value() {
       *      return this.name
       *    }
       * }
       */
      const res = Reflect.get(target, key, receiver)
      // 数据获取 要进行依赖收集
      track(res, TrackType.GET, key)
      // 如果是 引用类型要再进行代理
      if(isObject(res)) {
        return reactive(res)
      }

      return res
    },
    set(target, key: string, value: any, receiver) {
      // 数据更新 要进行 事件触发
      const res = Reflect.set(target, key, value, receiver)
      triggerEvents(target, TrackType.SET, key, value)
      return res
    },
  })
}