import { ReactiveEffect } from "./effect";

export function computed(getter: Function) {
  const effect = new ReactiveEffect(getter)

  return effect.run()
}