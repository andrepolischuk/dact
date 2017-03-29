# recd [![Build Status][travis-image]][travis-url]

> Simple data container

## Install

```sh
npm install --save recd
```

## Usage

```js
import createData from 'recd'

const profile = createData({})
const setName = profile.transform(name => ({name}))

profile.subscribe(data => console.log(data))

setName('unicorn')
profile.pull() // {name: 'unicorn'}
```

## API

### createData(initial)

Create and return `data` instance with `initial`.

#### initial

Type: `object`

### data.pull()

Pull current data.

### data.push(next)

Merge current data snapshot with `next` and replace.

#### next

Type: `object`

### data.subscribe(listener)

Add listener invoke after data is changed.

#### listener(next)

Type: `function`

##### next

Type: `object`

Updated data snapshot.

### data.transform(fn)

Create data transform function.

#### fn([...args, ]data)

Type: `function`

##### data

Type: `function`

Link for `data`.

Sync transform:

```js
const setLoading = profile.transform(loading => ({loading}))
```

Async transform:

```js
const getProfile = profile.transform(async (id, data) => {
  if (data().loading) {
    return 
  }

  setLoading(true)
  const info = await request(id)

  return {
    ...info, 
    loading: false 
  }
})
```

### data()

Alias for `data.pull()`.

### data(next)

Alias for `data.push(next)`.

## License

MIT

[travis-url]: https://travis-ci.org/andrepolischuk/recd
[travis-image]: https://travis-ci.org/andrepolischuk/recd.svg?branch=master
