export default function createData (initial, ...middlewares) {
  const listeners = {}
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

  const transform = pipe(...middlewares.map(mw => mw(data)))(merge)

  function pipe (...fns) {
    if (fns.length === 0) {
      return arg => arg
    }

    if (fns.length === 1) {
      return fns[0]
    }

    return fns.reduce((a, b) => (...args) => a(b(...args)))
  }

  function notify (stateKey, state) {
    const nested = listeners[stateKey]

    if (nested) {
      for (let i = 0; i < nested.length; i++) {
        nested[i](state)
      }
    }
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

    for (let extendKey in extend) {
      if (extend.hasOwnProperty(extendKey)) {
        notify(extendKey, state)
      }
    }

    notify('*', state)
  }

  function emit (extend, ...args) {
    if (typeof extend !== 'function' && typeof extend !== 'object') {
      throw new TypeError('Expected emitted value to be an object or function')
    }

    if (typeof extend === 'object') {
      return transform(extend)
    }

    const meta = extend && extend.name
    const result = extend(...args, data)

    if (result && typeof result.then === 'function') {
      return result.then(res => transform(res, meta))
    }

    return transform(result, meta)
  }

  function subscribe (stateKey, listener) {
    if (typeof stateKey === 'function') {
      listener = stateKey
      stateKey = '*'
    }

    if (typeof listener !== 'function') {
      throw new TypeError('Expected listener to be a function')
    }

    if (!listeners[stateKey]) {
      listeners[stateKey] = []
    }

    listeners[stateKey].push(listener)
  }

  return data
}
