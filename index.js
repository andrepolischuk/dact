export default function createData (initial, ...middlewares) {
  const listeners = []
  let state = initial

  const data = {
    emit,
    subscribe,
    get state () {
      return state
    },
    set state (extend) {
      throw new Error('Expected extend state by emit instead of mutate directly')
    }
  }

  const transform = pipe(...middlewares.map(m => m(data)))

  function pipe (...fns) {
    if (fns.length === 0) {
      return arg => arg
    }

    if (fns.length === 1) {
      return fns[0]
    }

    return fns.reduce((a, b) => (...args) => a(b(...args)))
  }

  function merge (extend) {
    if (!extend || state === extend) {
      return extend
    }

    if (typeof extend !== 'object') {
      throw new TypeError('Expected state extender to be an object')
    }

    state = {
      ...state,
      ...extend
    }

    for (let i = 0; i < listeners.length; i++) {
      listeners[i](state)
    }
  }

  function emit (extend, ...args) {
    if (typeof extend !== 'function' && typeof extend !== 'object') {
      throw new TypeError('Expected emitted value to be an object or function')
    }

    if (typeof extend === 'object') {
      return transform(merge)(extend)
    }

    return transform(merge)(extend(...args, state), extend && extend.name)
  }

  function subscribe (listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Expected listener to be a function')
    }

    listeners.push(listener)
  }

  return data
}
