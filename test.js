import test from 'ava'
import createData from './index'

const request = id => new Promise(resolve => {
  setTimeout(() => {
    resolve({id, name: 'Foo'})
  }, 10)
})

const createProfile = () => {
  const profile = createData({loading: false})
  const setLoading = profile.transform(loading => ({loading}))

  const getProfile = profile.transform(async (id, meta, pull) => {
    if (pull().loading) {
      return
    }

    setLoading(true)
    const info = await request(id)

    return {
      ...info,
      meta,
      loading: false
    }
  })

  return {
    profile,
    setLoading,
    getProfile
  }
}

test('initial', t => {
  const {profile} = createProfile()

  t.is(typeof profile.pull, 'function')
  t.is(typeof profile.push, 'function')
  t.is(typeof profile.subscribe, 'function')
  t.is(typeof profile.transform, 'function')
  t.deepEqual(profile.pull(), {loading: false})
})

test('push', t => {
  const {profile} = createProfile()

  t.deepEqual(profile.pull(), {loading: false})
  profile.push({loading: true})
  t.deepEqual(profile.pull(), {loading: true})
})

test('empty push', t => {
  const {profile} = createProfile()

  t.deepEqual(profile.pull(), {loading: false})
  profile.push()
  profile.push(null)
  t.deepEqual(profile.pull(), {loading: false})
})

test('wrong push', t => {
  const {profile} = createProfile()

  const stringError = t.throws(() => {
    profile.push('foo')
  }, TypeError)

  const functionError = t.throws(() => {
    profile.push(() => {})
  }, TypeError)

  t.is(stringError.message, 'Expected `next` data to be an object')
  t.is(functionError.message, 'Expected `next` data to be an object')
})

test('transform', t => {
  const {profile, setLoading} = createProfile()

  t.is(typeof setLoading, 'function')
  setLoading(true)
  t.deepEqual(profile.pull(), {loading: true})
})

test('async transform', async t => {
  const {profile, getProfile} = createProfile()

  t.is(typeof getProfile, 'function')
  await getProfile(0, 'Bar')
  t.deepEqual(profile.pull(), {loading: false, id: 0, name: 'Foo', meta: 'Bar'})
})

test('wrong transform', t => {
  const {profile} = createProfile()

  const undefinedError = t.throws(() => {
    profile.transform()
  }, TypeError)

  const objectError = t.throws(() => {
    profile.transform({})
  }, TypeError)

  t.is(undefinedError.message, 'Expected transform `fn` to be a function')
  t.is(objectError.message, 'Expected transform `fn` to be a function')
})

test.cb('listener', t => {
  t.plan(1)

  const {profile, setLoading} = createProfile()

  profile.subscribe(data => {
    t.deepEqual(data, {loading: true})
    t.end()
  })

  setLoading(true)
})

test.cb('async listener', t => {
  t.plan(1)

  const {profile} = createProfile()

  const setProfile = profile.transform(async id => {
    await request()

    return {
      id
    }
  })

  profile.subscribe(data => {
    t.deepEqual(data, {loading: false, id: 0})
    t.end()
  })

  setProfile(0, 'Foo')
})

test('wrong listener', t => {
  const {profile} = createProfile()

  const undefinedError = t.throws(() => {
    profile.subscribe()
  }, TypeError)

  const objectError = t.throws(() => {
    profile.subscribe({})
  }, TypeError)

  t.is(undefinedError.message, 'Expected `listener` to be a function')
  t.is(objectError.message, 'Expected `listener` to be a function')
})
