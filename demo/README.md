# Demo Signing App

A demo app to login and sign an arbitrary message, with both MetaMask and Wally, to compare the provider api and help with implementation.

## Requirements

- you have the MetaMask extension installed
- `wally-api` running _(locally, haven't tested prod yet)_
- redirect url set to `http://localhost:3000/handle-redirect` in the `wallet-dashboard` for your app

## Install

`yarn`

## Work

`npm run dev`

## wallet-connector updates

If you make changes to the `wallet-connector`, make sure you run `npm run build:demo` or `npm run build:demo:watch` in the top level project directory to build that package.
