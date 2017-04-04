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
  t.deepEqual(profile.state, {loading: false})
  profile.emit(data => data.state)
  t.deepEqual(profile.state, {loading: false})
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

test.cb('listener', t => {
  t.plan(1)

  const profile = createData(initial)

  profile.subscribe(() => {
    t.deepEqual(profile.state, {loading: true})
    t.end()
  })

  profile.emit(setLoading, true)
})

test.cb('async listener', t => {
  t.plan(2)

  const profile = createData(initial)
  let i = 0

  profile.subscribe(() => {
    if (i++ === 0) {
      t.deepEqual(profile.state, {loading: true})
    } else {
      t.deepEqual(profile.state, {loading: false, id: 0, name: 'Foo'})
      t.end()
    }
  })

  profile.emit(getProfile, 0)
})

test.cb('nested listener', t => {
  t.plan(1)

  const profile = createData({
    app: null,
    user: null
  })

  profile.subscribe('user', () => {
    t.deepEqual(profile.state, {app: 'Foo', user: 'Bar'})
    t.end()
  })

  profile.emit({app: 'Foo'})
  profile.emit({user: 'Bar'})
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
