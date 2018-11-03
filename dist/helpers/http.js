"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpHelpers = /** @class */ (function () {
    function HttpHelpers() {
    }
    HttpHelpers.prototype.httpCall = function (method, url, data, callback) {
        console.log(method + ": " + url);
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
    return HttpHelpers;
}());
exports.HttpHelpers = HttpHelpers;
//# sourceMappingURL=http.js.map