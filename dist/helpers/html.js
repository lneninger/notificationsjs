"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HtmlHelpers = /** @class */ (function () {
    function HtmlHelpers() {
    }
    HtmlHelpers.addScript = function (url, onLoadFn, onErrorFn) {
        console.log('loading url: ', url);
        var urls = [];
        console.log("typeof " + url + " = string: ", (typeof (url) == 'string'));
        if (typeof (url) === 'string') {
            urls.push(url);
        }
        else {
            urls = url;
        }
        var checkCounters = function (loadCounter, errorCounter, urls, onLoadFn, onErrorFn) {
            console.log("loadCounter:" + loadCounter + ", errorCounter: " + errorCounter);
            if (loadCounter + errorCounter == urls.length) {
                if (errorCounter > 0) {
                    if (onErrorFn != null)
                        onErrorFn();
                }
                else if (onLoadFn != null)
                    onLoadFn();
            }
        };
        console.log('Creating script tags');
        var loadCounter = 0;
        var errorCounter = 0;
        for (var urlIndex = 0; urlIndex < urls.length; urlIndex++) {
            console.log('new script tag', urls[urlIndex]);
            var newScript = document.createElement("script");
            newScript.onload = function () { loadCounter++; checkCounters(loadCounter, errorCounter, urls, onLoadFn, onErrorFn); };
            newScript.onerror = function () { errorCounter++; checkCounters(loadCounter, errorCounter, urls, onLoadFn, onErrorFn); };
            document.head.appendChild(newScript);
            newScript.src = urls[urlIndex];
        }
    };
    HtmlHelpers.getParent = function (element, selector) {
        var loopElement = element;
        for (; loopElement && loopElement !== document; loopElement = loopElement.parentNode) {
            if (loopElement.matches(selector)) {
                return loopElement;
            }
        }
        return null;
        ;
    };
    HtmlHelpers.addStyle = function (url, onLoadFn, onErrorFn) {
        var linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        document.head.appendChild(linkElement);
        linkElement.setAttribute('href', url);
        console.log('Adding style', linkElement);
    };
    HtmlHelpers.createButton = function (text) {
        var btn = document.createElement("BUTTON");
        var t = document.createTextNode(text); // Create a text node
        btn.appendChild(t);
        return btn;
    };
    HtmlHelpers.hasClass = function (element, className) {
        return (element.className.indexOf(className) != -1);
    };
    HtmlHelpers.addClass = function (element, className) {
        var split = className.split(' ');
        for (var i = 0; i < split.length; i++) {
            if (this.hasClass(element, split[i]))
                continue;
            element.className = element.className + (element.className.length > 0 ? ' ' : '') + split[i];
        }
    };
    HtmlHelpers.removeClass = function (element, className) {
        var split = className.split(' ');
        for (var i = 0; i < split.length; i++) {
            element.className = element.className.replace(split[i], '');
        }
    };
    HtmlHelpers.addEvent = function (element, eventName, eventFn) {
        element.addEventListener(eventName, eventFn);
    };
    HtmlHelpers.setCookie = function (name, val, expiresInMinutes) {
        var date = new Date();
        var value = val;
        // Set it expire in 7 days
        date.setTime(date.getTime() + ( /*7 * 24 * */(expiresInMinutes /* / 60*/) * 60 * 1000));
        // Set it
        document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
    };
    HtmlHelpers.getCookie = function (name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    };
    HtmlHelpers.deleteCookie = function (name) {
        var date = new Date();
        // Set it expire in -1 days
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        // Set it
        document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";
    };
    return HtmlHelpers;
}());
exports.HtmlHelpers = HtmlHelpers;
//# sourceMappingURL=html.js.map