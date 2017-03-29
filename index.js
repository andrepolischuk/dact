export default function createData (initial) {
  const listeners = []
  let state = initial

  function pull () {
    return state
  }

  function push (next) {
    if (!next) {
      return
    }

    state = {
      ...state,
      ...next
    }

    for (let i = 0; i < listeners.length; i++) {
      listeners[i](state)
    }

    return state
  }

  function subscribe (listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Expected `listener` to be a function')
    }

    listeners.push(listener)
  }

  function transform (fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('Expected transform `fn` to be a function')
    }

    return (...args) => {
      const next = fn(...args, data)

      if (next && typeof next.then === 'function') {
        return next.then(push)
      }

      return push(next)
    }
  }

  function data (next) {
    if (next) {
      return push(next)
    }

    return pull()
  }

  data.pull = pull
  data.push = push
  data.subscribe = subscribe
  data.transform = transform

  return data
}
