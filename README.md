# ~~KnarQL~~ Gravsearch me!

[![Build Status](https://travis-ci.org/gfoo/knarql-me.svg?branch=master)](https://travis-ci.org/gfoo/knarql-me)

A simple web app to test [~~KnarQL~~ Gravsearch queries](http://www.knora.org/documentation/manual/rst/03-knora-api-server/api_v2/knarql-syntax.html).

![alt text](screenshot.png 'App screenshot')

Just run its container:

```
docker run -p 80:80 gfoo/knarql-me
```

and visit http://0.0.0.0

Or for developers:

```
git clone https://github.com/gfoo/knarql-me.git
cd knarql-me
yarn
ng s
```

and visit http://0.0.0.0:4200
