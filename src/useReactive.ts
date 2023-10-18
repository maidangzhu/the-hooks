// eslint-disable-next-line import/no-cycle
import { useCreation, useLatest, useUpdate } from './index'

const observer = <T extends Record<string, any>>(initialVal: T, cb: () => void): T => {
  return new Proxy<T>(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      return typeof res === 'object' ? observer(res, cb) : Reflect.get(target, key)
    },
    set(target, key, val) {
      const ret = Reflect.set(target, key, val)
      cb()
      return ret
    },
  })
}

const useReactive = <T extends Record<string, any>>(initialState: T): T => {
  const ref = useLatest<T>(initialState)
  const update = useUpdate()

  return useCreation(() => {
    return observer(ref.current, () => {
      update()
    })
  }, [])
}

export { useReactive }
