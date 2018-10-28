"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Http = /** @class */ (function () {
    function Http() {
    }
    Http.prototype.httpCall = function (method, url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if (callback)
            xhr.onload = function () { callback(JSON.parse(this['responseText'])); };
        if (data != null) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
        else
            xhr.send();
    };
    return Http;
}());
exports.Http = Http;
//# sourceMappingURL=http.js.map