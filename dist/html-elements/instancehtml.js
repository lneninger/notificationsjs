"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html_1 = require("../helpers/html");
var rxjs_1 = require("rxjs");
var InstanceHtml = /** @class */ (function () {
    function InstanceHtml() {
        this.headerClick = new rxjs_1.Subject();
    }
    InstanceHtml.createWidgetShell = function (notificationGroupService) {
        // Configure Wrapper
        var result = new InstanceHtml();
        //HtmlHelpers.addClass(this.elements.wrapper, this.collapsedClass);
        // Configure instance
        var instanceElement = document.createElement("notification-instance");
        instanceElement.className = '';
        instanceElement.setAttribute(InstanceHtml.InstanceNameAttributeName, notificationGroupService.notification.accountKey);
        html_1.HtmlHelpers.addEvent(instanceElement, 'click', function ($event) { result.headerClick.next({ $event: $event }); });
        result.wrapper = instanceElement;
        var header = document.createElement("notification-header");
        header.className = '';
        result.header = header;
        result.wrapper.appendChild(header);
        return result;
    };
    InstanceHtml.getINotificationGroupByElement = function (element, notificationGroups) {
        var loopElement = element;
        var selector = 'notification-instance';
        var instanceElement = html_1.HtmlHelpers.getParent(element, selector);
        if (instanceElement != null) {
            var instanceAttr = loopElement.getAttribute(InstanceHtml.InstanceNameAttributeName);
            var matchInstances = notificationGroups.filter(function (group) { return group.notification.accountKey; });
            if (matchInstances.length > 0) {
                return matchInstances[0];
            }
        }
        return null;
        ;
    };
    InstanceHtml.InstanceNameAttributeName = 'instance';
    return InstanceHtml;
}());
exports.InstanceHtml = InstanceHtml;
//# sourceMappingURL=instancehtml.js.map