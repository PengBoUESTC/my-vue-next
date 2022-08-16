
const NOOP = () => {}

export class ReactiveEffect {
  public fn: Function = NOOP
  public options: Record<string, any> = {}
  public parent: ReactiveEffect | undefined = undefined
  constructor(fn: Function, options: Record<string, any>) {
    this.fn = fn
    this.options = options
  }

  // 函数调用
  run() {
    this.parent = activeEffect
    activeEffect = this

    this.fn()

    activeEffect = this.parent
  }
}

export let activeEffect: ReactiveEffect | undefined

// 副作用
export function effect(fn: Function, options: Record<string, any>) {

  const reactiveEffect = new ReactiveEffect(fn, options)
}