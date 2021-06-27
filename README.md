flush-npm
=====

[![Version](https://img.shields.io/npm/v/flush-npm.svg)](https://npmjs.org/package/flush-npm)
[![npm](https://img.shields.io/npm/dt/flush-npm)](https://npmjs.org/package/flush-npm)

![flush-npm example](/flush-npm.gif?raw=true "flush-npm example")

# Usage
Install it globally via Volta or npm.

## Use Volta
```sh-session
$ volta install flush-npm
```

## Use npm
```sh-session
$ npm i -g flush-npm
```

When run `flush-npm` in your project directory, it will:
1. Remove `node_modules/`
2. Remove `package-lock.json`
3. Run `npm install`
