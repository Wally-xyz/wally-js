# Demo Signing App

A demo app to login and sign an arbitrary message, with both MetaMask and Wally, to compare the provider api and help with implementation.

## Requirements

- you have the MetaMask extension installed
- `wally-api` running _(locally, haven't tested prod yet)_

## Install

`yarn`

## Work

`npm run dev`

## wallet-connector updates

If you make changes to the `wallet-connector`, make sure you run `npm run build` or `npm run watch` in the top level project directory to build that package. It is pulled in with `yarn link wally-sdk`, so if the changes aren't updating, run `yarn link` in the top level directory.
