
export type EffectScheduler = (...args: any[]) => any


const NOOP = () => {}

export function cleanupEffect(activeEffect: ReactiveEffect) {
  const deps = activeEffect.deps;
  const len = deps.length
  // 依赖清除 将 target 中收集的 effect 依赖删除 并清空 effect 中记录的依赖
  for(let i = 0; i < len; i ++) {
    deps[i].delete(activeEffect)
  }
  activeEffect.deps = []
}
export class ReactiveEffect {
  public fn: Function = NOOP
  public scheduler: EffectScheduler | null | undefined
  public parent: ReactiveEffect | undefined = undefined
  public active: boolean = true
  public deps: Set<ReactiveEffect>[] = [] // 存储一份 数据的 依赖 用于依赖清除
  constructor(fn: Function, scheduler?: EffectScheduler | null) {
    this.fn = fn
    this.scheduler = scheduler
  }

  // 函数调用
  run() {
    if(!this.active) return this.fn()
    this.parent = activeEffect
    activeEffect = this
    // 依赖清除
    cleanupEffect(this)
    const res = this.fn()

    activeEffect = this.parent
    this.parent = undefined
    return res
  }

  stop() {
    cleanupEffect(this)
    this.active = false
  }
}

export let activeEffect: ReactiveEffect | undefined

// 副作用
export function effect(fn: Function, options?: Record<string, any>) {
  const { scheduler } = options || {}
  const reactiveEffect = new ReactiveEffect(fn, scheduler)
  reactiveEffect.run()
}