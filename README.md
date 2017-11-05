# Webpack-dev-server middleware for requiring remote http an address and inject bundle.js

This project is a `webpack-dev-server` middleware that inject `bundle.js` (or other configurable paths) in a remote page `locally`.

If you have a local server that render a `jinja2 template` (or other template rendering) running on port `3001`, you can inject `bundle.js` in `any` page served by this address for development purposes and use `webpack` with `livereload`.

Ex:

``` bash
$ curl 'http://localhost:3001/hello-world'
<html>
  <body>Hello world</body>
</html>
```

After install this project on your `webpack-dev-server` running locally on port `3000`:

Ex:

``` bash
$ curl 'http://localhost:3001/real-server/http://localhost:3001/hello-world'
<html>
  <body>
    Hello world
    <script type="text/javascript" src="/static/js/bundle.js"></script>
  </body>
</html>
```

## How to use?

Install with `npm`:


``` bash
$ npm install remote-http-middleware
```

So, on your `webpackDevServer.config.js` you need to install on your `app` using `app.use()` like:

``` js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const remoteHTTPMiddleware = require('remote-http-middleware');

    ...

module.exports = function (proxy, allowedHost) {
  return {
      ...

    before(app) {
        ...

      app.use(remoteHTTPMiddleware({
        plugins: config.plugins,
        HtmlWebpackPlugin: HtmlWebpackPlugin,
        assets: {
          manifest: false,
          js: [`${config.output.publicPath || ""}${config.output.filename}`],
          css: [],
        }
      }));
    },
  };
};
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
