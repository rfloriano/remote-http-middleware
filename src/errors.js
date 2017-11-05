function ReferenceError(message) {
    this.name = 'ReferenceError';
    // TODO: improve this message
    this.message = message || 'RemoteHttpMiddleware need a reference to HtmlWebpackPlugin.';
    this.stack = (new Error()).stack;
}
ReferenceError.prototype = Object.create(ReferenceError.prototype);
ReferenceError.prototype.constructor = ReferenceError;

module.exports = {
    ReferenceError: ReferenceError
}
