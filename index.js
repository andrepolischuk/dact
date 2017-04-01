export default function createData (initial) {
  const listeners = []
  let state = initial

  function emit (next, ...args) {
    if (typeof next === 'function') {
      return emit(next(...args, state))
    }

    if (!next || typeof next !== 'object') {
      throw new TypeError('Expected `next` state to be an object')
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

  const data = {
    emit,
    subscribe,
    get state () {
      return state
    },
    set state (next) {
      throw new Error('Expected update `state` by `emit` instead of mutate directly')
    }
  }

  return data
}
