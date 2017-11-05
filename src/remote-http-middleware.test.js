const HtmlWebpackPlugin = require('html-webpack-plugin');
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

    describe('init method', () => {
        it('should define instance.config', () => {
            this.instance.config = undefined;
            this.instance.init({
                HtmlWebpackPlugin: 'just to bypass constructor errors'
            });
            expect(this.instance.config).not.toBe(undefined);
        })

        it('should define instance.htmlWebpackPlugin', () => {
            this.instance.htmlWebpackPlugin = undefined;
            this.instance.init(this.config);
            expect(this.instance.htmlWebpackPlugin).toBe(this.htmlWebpackPlugin);
        })
    })

    describe('getConfig method', () => {
        it('should explode if not receive reference to HtmlWebpackPlugin', () => {
            expect(this.instance.getConfig).toThrowError(ReferenceError);
        });

        it('should merge DEFAULT_CONFIG and customConfig', () => {
            const customConfig = {
                HtmlWebpackPlugin: 'just to bypass constructor errors',
                myConfig: true,
            }
            let config = {};
            expect(config.myConfig).toBe(undefined);
            config = this.instance.getConfig(customConfig);
            expect(config.myConfig).not.toBe(undefined);
        });
    })

    describe('"do" method', () => {
        beforeEach(() => {
            this.htmlFake = 'hello world';
            this.doParams = {
                req: {
                    method: 'GET',
                    headers: {
                        foo: 'bar'
                    },
                    url: `${this.instance.config.url}localhost:3001/hello-world`,
                },
                res: {
                    send: jest.fn(),
                },
                next: jest.fn(),
            };
            this.htmlWebpackPlugin.generateAssetTags = jest.fn();
            this.htmlWebpackPlugin.postProcessHtml = jest.fn(() => {
                const html = `${this.htmlFake} post process html`;
                return { then: jest.fn(cb => cb(html)) }
            });
            this.requestCb = jest.fn();
            this.requestCb.on = jest.fn((ev, cb) => {
                if (ev === 'data') { return cb(this.htmlFake); }
                return cb();
            });
            this.requestCb.write = jest.fn();
            this.requestCb.end = jest.fn();
            this.fakeHttpReq = jest.fn((ops, cb) => {
                cb(this.requestCb);
                return this.requestCb
            });
            spyOn(http, 'request').and.callFake(this.fakeHttpReq);
        });

        it('should call next when url not start with prefix', () => {
            this.doParams.req.url = `some-other${this.instance.config.url}`;
            expect(this.doParams.next).not.toHaveBeenCalled();
            this.instance.do(this.doParams.req, this.doParams.res, this.doParams.next);
            expect(this.doParams.next).toHaveBeenCalled();
        });

        it('should parse url and make remote request', () => {
            getRawBody.mockImplementation((_, __, cb) => cb(null, 'some-body'));
            this.instance.do(this.doParams.req, this.doParams.res, this.doParams.next);
            expect(this.doParams.next).not.toHaveBeenCalled();
            expect(this.fakeHttpReq).toBeCalledWith({
                headers: { foo: "bar" },
                host: "localhost",
                method: "GET",
                path: "/hello-world",
                port: "3001",
                protocol: "http:",
                query: null
            }, expect.any(Function));
            expect(this.doParams.res.send).toHaveBeenCalledWith('hello world post process html');
            expect(this.requestCb.write).toHaveBeenCalledWith('some-body');
        });
    })
});
