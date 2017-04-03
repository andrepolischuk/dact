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

function saveProfile (info, meta, state) {
  return {
    ...info,
    meta,
    notLoading: !state.loading
  }
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

  t.is(error.message, 'Expected update `state` by `emit` instead of mutate directly')
})

test('simple emit', t => {
  const profile = createData(initial)

  t.deepEqual(profile.state, {loading: false})
  profile.emit({loading: true})
  t.deepEqual(profile.state, {loading: true})
})

test('emit function', async t => {
  const profile = createData(initial)

  profile.emit(setLoading, true)
  t.deepEqual(profile.state, {loading: true})

  const info = await request(1)

  profile.emit(setLoading, false)
  t.deepEqual(profile.state, {loading: false})
  profile.emit(saveProfile, info, 'Bar')

  t.deepEqual(profile.state, {
    id: 1,
    name: 'Foo',
    meta: 'Bar',
    loading: false,
    notLoading: true
  })
})

test('emit without transform', t => {
  const profile = createData(initial)

  profile.emit()
  t.deepEqual(profile.state, {loading: false})
  profile.emit(initial)
  t.deepEqual(profile.state, {loading: false})
  profile.emit(state => state)
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

  t.is(numberError.message, 'Expected `next` state to be an object')
  t.is(stringError.message, 'Expected `next` state to be an object')
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
  t.plan(1)

  const profile = createData(initial)

  async function setProfile (id) {
    await request()

    profile.emit({
      id
    })
  }

  profile.subscribe(() => {
    t.deepEqual(profile.state, {loading: false, id: 0})
    t.end()
  })

  setProfile(0)
})

test('wrong listener', t => {
  const profile = createData(initial)

  const undefError = t.throws(() => {
    profile.subscribe()
  }, TypeError)

  const objectError = t.throws(() => {
    profile.subscribe({})
  }, TypeError)

  t.is(undefError.message, 'Expected `listener` to be a function')
  t.is(objectError.message, 'Expected `listener` to be a function')
})
