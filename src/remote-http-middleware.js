'use strict';

const http = require('http');
const getRawBody = require('raw-body');
const urlParse = require('url').parse;
const { ReferenceError } = require('./errors');

const DEFAULT_CONFIG = {
    plugins: [],
    assets: {},
    rawBodyParams: {},
    url: '/real-server/',
};

function RemoteHttpMiddleware(middlewareConfig) {
    this.init(middlewareConfig);
}

RemoteHttpMiddleware.prototype.init = function (middlewareConfig) {
    this.config = this.getConfig(middlewareConfig);
    this.htmlWebpackPlugin = this.findHtmlWebpackPlugin();
}

RemoteHttpMiddleware.prototype.getConfig = function (middlewareConfig) {
    const config = Object.assign({}, DEFAULT_CONFIG, middlewareConfig);
    if (!config.HtmlWebpackPlugin) {
        throw new ReferenceError();
    }
    return config;
}

RemoteHttpMiddleware.prototype.findHtmlWebpackPlugin = function () {
    let htmlWebpackPlugin = null;
    for (let plugin of this.config.plugins) {
        if (!(plugin instanceof this.config.HtmlWebpackPlugin)) {
            continue;
        }
        htmlWebpackPlugin = plugin;
        break;
    }
    return htmlWebpackPlugin;
}

RemoteHttpMiddleware.prototype.do = function (req, res, next) {
    if (!req.url.startsWith(this.config.url)) {
        return next();
    }
    let urlString = req.url.replace(this.config.url, '');
    if (!urlString.startsWith("http")) {
        urlString = `http://${urlString}`;
    }
    const url = urlParse(urlString);
    getRawBody(req, this.config.rawBodyParams, (err, text) => {
        if (err) {
            return next();
        }
        const options = {
            protocol: url.protocol,
            host: url.hostname,
            port: url.port,
            path: url.path,
            query: url.query,
            method: req.method,
            headers: req.headers,
        }
        const serverReq = http.request(options, (remoteRes) => {
            let body = '';
            remoteRes.on('data', (d) => {
                body += d;
            });
            remoteRes.on('end', () => {
                const assetTags = this.htmlWebpackPlugin.generateAssetTags(this.config.assets);
                const htmlPromise = this.htmlWebpackPlugin.postProcessHtml(body, this.config.assets, assetTags);
                htmlPromise.then((html) => {
                    res.send(html);
                })
            });
        });
        serverReq.write(text);
        serverReq.end();
    })
}

module.exports = {
    RemoteHttpMiddleware: RemoteHttpMiddleware
}
