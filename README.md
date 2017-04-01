# dact [![Build Status][travis-image]][travis-url]

> Simple data container

Data manipulations should be simple. Simple flow based on trasformation functions makes possible
to create applications without writing mass of boilerplate code.

It's my try to create minimal data container. Small size ~2kb, no dependencies, simple api.

## Install

```sh
npm install --save dact
```

## Usage

```js
import createData from 'dact'

const profile = createData({})

profile.subscribe(() => {
  console.log(profile.state)
})

function setName (name) {
  return {
    name
  }
}

profile.emit(setName, 'unicorn')
profile.state // {name: 'unicorn'}
```

## API

### createData(initial)

Create and return `data` instance with `initial`.

#### initial

Type: `object`

### data.state

Pull latest state.

### data.emit(next)

Merge latest state with `next` or transform and replace.

#### next

Type: `object`

#### next([...args], state)

Type: `function`

### data.subscribe(listener)

Add listener invoke after state is changed.

#### listener(state)

Type: `function`

##### state

Type: `object`

Latest state.

## License

MIT

[travis-url]: https://travis-ci.org/andrepolischuk/dact
[travis-image]: https://travis-ci.org/andrepolischuk/dact.svg?branch=master
