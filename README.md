# dact [![Build Status][travis-image]][travis-url]

> Simple data container

Data manipulations should be simple. Simple flow based on functions extend state makes possible
to create applications without writing mass of boilerplate code.

It's my try to create minimal data container. Small size `~1kb`, simple api, extend functions,
subscriptions to sub-state, extendable by middlewares.

## Install

```sh
npm install --save dact
```

## Usage

```js
import createData from 'dact'

const data = createData({
  users: []
})

function sortUsers (data) {
  const users = data.state.users.sort()

  return {
    users
  }
}

async function addUser (name, data) {
  const user = await request(name)
  const users = data.state.users.filter(user => user !== name)

  return {
    users: [
      ...users,
      user.name
    ]
  }
}

data.subscribe(() => {
  console.log(data.state)
  // {users: ['unicorn']}
  // {users: ['unicorn', 'pony']}
  // {users: ['pony', 'unicorn']}
})

async function init () {
  await data.emit(addUser, 'unicorn')
  await data.emit(addUser, 'pony')
  data.emit(sortUsers)
}

init()
```

See also [example application](https://github.com/andrepolischuk/dact-example).

## API

### createData(initial[, ...middlewares])

Create and return `data` instance with `initial` state.

#### initial

Type: `object`

#### middlewares

Type: `...function`

Logging middleware for example:

```js
function logger (data) {
  return next => extend => {
    console.log(extend)

    return next(extend)
  }
}
```

##### data

Link to `data` instance.

##### next

Next chain function.

##### extend

Data for merge with current state.

### data.state

Pull current state.

### data.emit(extend)

Merge current state with `extend` or transform and replace.

#### extend

Type: `object`

```js
const data = createData({loading: false})

data.emit({loading: true})
data.state // {loading: true}
```

#### extend([...args], data)

Type: `function`

```js
const data = createData({
  users: [
    'pony',
    'unicorn'
  ]
})

function deleteUser (name, data) {
  const users = data.state.users.filter(user => user !== name)

  return {
    users
  }
}

data.emit(deleteUser, 'pony')
data.state // { users: ['unicorn'] }
```

### data.subscribe([stateKey, ]listener)

Add listener invoke after state is changed. Returns a function for unsubscribe listener.

#### stateKey

Type: `string`

Allow subscribe to first level sub-state.

#### listener(state)

Type: `function`

##### state

Type: `object`

Current root state.

## License

MIT

[travis-url]: https://travis-ci.org/andrepolischuk/dact
[travis-image]: https://travis-ci.org/andrepolischuk/dact.svg?branch=master
