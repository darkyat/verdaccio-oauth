# verdaccio-oauth [Work in Progress] #
An OAuth plugin for [Verdaccio](https://github.com/verdaccio/verdaccio).

## Installation ##
```sh
npm i -g verdaccio-oauth
```

## Configuration ##
```yaml
#...

auth:
  oauth:
    # provider can be any service supported by https://www.npmjs.com/package/grant
    provider: github
    key: KEY/CLIENT_ID
    secret: SECRET

middlewares:
  oauth:

# ...
```
