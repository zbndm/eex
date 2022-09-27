# Telegram Web Apps Client SDK

TypeScript reimplementation of Telegram's official library for communicating 
with Telegram Web Apps.

> ⚠️ This library is not the same library created by Telegram developers
> but with types. It contains similar code, but differs a bit in some moments.
> Please, refer to documentation in code to avoid problems.

## Motivation
- Currently, official implementation supports usage only through global
  `window` object that is not modern and not that comfortable as importing
  this library as npm package. Nevertheless, it does not mean, this use case
  should not exist. Some applications may not support modern way of
  using packages and as a result, the only one possible solution for them is
  usage through `window` object;
- Library is written in JavaScript without usage of JSDoc. Modern libraries
  are now developed with TypeScript which allows developers to know the
  types they are currently working with;
- Library contains almost no comments. So, most of the time, it is harder
  to understand current code flow;

## Installation
### npm
```bash
npm i twa-client-sdk
```

### yarn
```bash
yarn add twa-client-sdk
```

## Usage

Library contains 2 global components which are commonly used in Web Apps.
They are `webView` and `webApp`. These variables are instances of
`WebView` and `WebApp` which are created by library itself. In case, there is
some specific application algorithm, its is allowed to create these instance by 
yourself and initialise, but we recommend using variables which are stored in 
library. 

One of the main important parts of SDK lifecycle is its initialization.
As long as `webView` and `webApp` initially have default values, you have
to fill them with usage of current environment (internally, init scripts read 
data from global `window` object). 

For this purpose, usage of function `init` is required:

```typescript
import {init} from 'twa-client-sdk';

// Initialise library.
init();

// Now, we can safely use variables `webView` and `webApp`.
```
"# eex" 
