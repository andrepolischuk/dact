import test from 'ava'
import createData from './index'

const request = id => new Promise(resolve => {
  setTimeout(() => {
    resolve({id, name: 'Foo'})
  }, 10)
})

const initial = {
  loading: false
}

function setLoading (loading) {
  return {
    loading
  }
}

async function getProfile (id, data) {
  data.emit({
    loading: true
  })

  const user = await request(id)

  data.emit({
    ...user,
    loading: false
  })
}

test('initial', t => {
  const profile = createData(initial)

  t.is(typeof profile.state, 'object')
  t.is(typeof profile.emit, 'function')
  t.is(typeof profile.subscribe, 'function')
  t.deepEqual(profile.state, {loading: false})
})

test('mutate directly', t => {
  const profile = createData(initial)

  const error = t.throws(() => {
    profile.state = {
      loading: true
    }
  }, Error)

  t.is(error.message, 'Expected extend state by emit instead of mutate directly')
})

test('simple emit', t => {
  const profile = createData(initial)

  t.deepEqual(profile.state, {loading: false})
  profile.emit({loading: true})
  t.deepEqual(profile.state, {loading: true})
})

test('emit function', t => {
  const profile = createData(initial)

  t.deepEqual(profile.state, {loading: false})
  profile.emit(setLoading, true)
  t.deepEqual(profile.state, {loading: true})
})

test('emit async function', async t => {
  const profile = createData(initial)

  t.deepEqual(profile.state, {loading: false})
  await profile.emit(getProfile, 0)
  t.deepEqual(profile.state, {loading: false, id: 0, name: 'Foo'})
})

test('emit without transform', t => {
  const profile = createData(initial)

  profile.emit(initial)
  t.is(profile.state, initial)
  profile.emit(data => data.state)
  t.is(profile.state, initial)
})

test('wrong emit', t => {
  const profile = createData(initial)

  const numberError = t.throws(() => {
    profile.emit(2)
  }, TypeError)

  const stringError = t.throws(() => {
    profile.emit('foo')
  }, TypeError)

  t.is(numberError.message, 'Expected emitted value to be an object or function')
  t.is(stringError.message, 'Expected emitted value to be an object or function')
})

test('listener', t => {
  const profile = createData(initial)
  let state

  profile.subscribe(() => {
    state = profile.state
  })

  profile.emit(setLoading, true)
  t.deepEqual(state, {loading: true})
})

test('async listener', async t => {
  const profile = createData(initial)
  let state
  let calls = 0

  profile.subscribe(() => {
    state = profile.state
    calls++
  })

  await profile.emit(getProfile, 0)
  t.is(calls, 2)
  t.deepEqual(state, {loading: false, id: 0, name: 'Foo'})
})

test('nested listener', t => {
  const profile = createData({
    app: null,
    user: null
  })

  let state

  profile.subscribe('user', () => {
    state = profile.state
  })

  profile.emit({app: 'Foo'})
  t.is(state, undefined)
  profile.emit({user: 'Bar'})
  t.deepEqual(state, {app: 'Foo', user: 'Bar'})
})

test('wrong listener', t => {
  const profile = createData(initial)

  const undefError = t.throws(() => {
    profile.subscribe()
  }, TypeError)

  const objectError = t.throws(() => {
    profile.subscribe({})
  }, TypeError)

  t.is(undefError.message, 'Expected listener to be a function')
  t.is(objectError.message, 'Expected listener to be a function')
})

test('unsubscribe listener', t => {
  const profile = createData(initial)
  let state

  const unsubscribe = profile.subscribe(() => {
    state = profile.state
  })

  profile.emit(setLoading, true)
  t.deepEqual(state, {loading: true})
  unsubscribe()
  profile.emit(setLoading, false)
  t.deepEqual(state, {loading: true})
})

test('middlewares', async t => {
  const middleware = data => next => (extend, meta) => {
    return next({
      ...extend,
      last: meta
    })
  }

  const profile = createData(initial, middleware)

  t.deepEqual(profile.state, {loading: false})
  profile.emit(setLoading, true)
  t.deepEqual(profile.state, {loading: true, last: 'setLoading'})
  await profile.emit(getProfile, 0)
  t.deepEqual(profile.state, {loading: false, id: 0, name: 'Foo', last: 'getProfile'})
})
