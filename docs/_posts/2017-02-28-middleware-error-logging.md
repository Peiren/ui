---
layout: page
title: "Error logging"
category: middleware
date: 2017-02-28 10:18:04
order: 2
---

The error logging middleware is not registered by default in the cmf store.

Once registered, it will catch every dispatch error and call a remote service to post 
* the user agent
* the redux state
* the action
* the error

## How to register it ?

```javascript
import { store as cmfstore, getErrorMiddleware } from 'react-cmf';

... 

const errorMiddleware = getErrorMiddleware(errorLoggingUrl);
const store = cmfstore.initialize(appReducer, preloadedState, enhancer, [errorMiddleware]);
```
