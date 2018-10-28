"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html_1 = require("../helpers/html");
var NotificationHtml = /** @class */ (function () {
    function NotificationHtml() {
    }
    Object.defineProperty(NotificationHtml.prototype, "expanded", {
        get: function () {
            return html_1.HtmlHelpers.hasClass(this.wrapper, NotificationHtml.expandedClass);
        },
        enumerable: true,
        configurable: true
    });
    NotificationHtml.expandedClass = 'expanded';
    NotificationHtml.collapsedClass = 'collapsed';
    return NotificationHtml;
}());
exports.NotificationHtml = NotificationHtml;
//# sourceMappingURL=notificationhtml.js.map