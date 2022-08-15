import { isObject } from '@vue/shared'

export function reactive() {
  console.log(isObject(1))
  console.log('=++++=======++')
}