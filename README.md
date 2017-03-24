# recd [![Build Status][travis-image]][travis-url]

> Simple data transformations

## Install

```sh
npm install --save recd
```

## Usage

```js
import createData from 'recd'

const profile = createData({})
const setName = profile.transform((data, name) => data({name}))

profile.subscribe(data => console.log(data))

setName('unicorn')
profile.pull() // {name: 'unicorn'}
```

## API

### createData(initial)

Create and return `data` instance with `initial`.

#### initial

Type: `object`

### data.pull([next])

Pull current data.

#### next

Type: `object`

Method merge current data snapshot with `next` if specified and return.

### data.subscribe(listener)

Add listener invoke after data is changed.

#### listener(next)

Type: `function`

##### next

Type: `object`

Updated data snapshot.

### data.transform(fn)

Create data transform function.

#### fn(pull[, ...args])

Type: `function`

##### pull

Type: `function`

Link for `data.pull` method.

Sync transform:

```js
const setLoading = profile.transform((data, loading) => data({loading}))
```

Async transform:

```js
const getProfile = profile.transform(async (data, id) => {
  if (data().loading) {
    return 
  }

  setLoading(true)
  const info = await request(id)

  return data({ 
    ...info, 
    loading: false 
  })
})
```

### data([next])

Alias for `data.pull([next])`.

### data(fn)

Alias for `data.transform(fn)`.

## License

MIT

[travis-url]: https://travis-ci.org/andrepolischuk/recd
[travis-image]: https://travis-ci.org/andrepolischuk/recd.svg?branch=master
