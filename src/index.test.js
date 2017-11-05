const HtmlWebpackPlugin = require('html-webpack-plugin');
const createRemoteHttpMiddleware = require('./index');
const { RemoteHttpMiddleware } = require('./remote-http-middleware');
const { ReferenceError } = require('./errors');
const getRawBody = require('raw-body');
const http = require('http');

jest.mock('raw-body');

describe('test', () => {
    beforeEach(() => {
        this.htmlWebpackPlugin = new HtmlWebpackPlugin();
        this.config = {
            plugins: [
                this.htmlWebpackPlugin
            ],
            HtmlWebpackPlugin: HtmlWebpackPlugin
        };
        this.instance = new RemoteHttpMiddleware(this.config);
    });

    describe('createRemoteHttpMiddleware function', () => {
        it('should bind do method', () => {
            const spy = spyOn(RemoteHttpMiddleware.prototype, 'do');
            const fn = createRemoteHttpMiddleware(this.config);
            expect(spy).not.toHaveBeenCalled();
            fn();
            expect(spy).toHaveBeenCalled();
        })
    });
});
