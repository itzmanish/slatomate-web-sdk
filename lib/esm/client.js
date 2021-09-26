var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var API_ENDPOINT = process.env.API_URL || "http://localhost:8000";
var Client = /** @class */ (function () {
    function Client(base_url) {
        var _this = this;
        this.call = function (opts) {
            return fetch(opts.url, {
                method: opts.method,
                headers: new Headers(__assign({}, opts.headers)),
                body: opts.body
            });
        };
        this.callWithAuth = function (opts) {
            return fetch(opts.url, {
                method: opts.method,
                headers: new Headers(__assign({ 'Authorization': 'APIKEY ' + _this.AUTH_TOKEN }, opts.headers)),
                body: opts.body
            });
        };
        this.API_ENDPOINT = base_url || API_ENDPOINT;
        this.AUTH_TOKEN = "";
    }
    Object.defineProperty(Client.prototype, "auth_token", {
        set: function (token) {
            this.AUTH_TOKEN = token;
        },
        enumerable: false,
        configurable: true
    });
    return Client;
}());
export { Client };
