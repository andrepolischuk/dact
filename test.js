import test from 'ava'
import createData from './index'

const request = id => new Promise(resolve => {
  setTimeout(() => {
    resolve({id, name: 'Foo'})
  }, 10)
})

const createProfile = () => {
  const profile = createData({loading: false})
  const setLoading = profile.transform((data, loading) => data({loading}))

  const getProfile = profile.transform(async (data, id, meta) => {
    if (data().loading) {
      return
    }

    setLoading(true)
    const info = await request(id)

    return data({
      ...info,
      meta,
      loading: false
    })
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
  t.is(typeof profile.subscribe, 'function')
  t.is(typeof profile.transform, 'function')
  t.deepEqual(profile.pull(), {loading: false})
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
  t.deepEqual(profile(), {loading: false, id: 0, name: 'Foo', meta: 'Bar'})
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

  const setProfile = profile.transform(async (data, id) => {
    await request()
    return data({id})
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
