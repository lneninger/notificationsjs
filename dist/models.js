"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationChannel = /** @class */ (function () {
    function NotificationChannel() {
    }
    NotificationChannel.createNew = function (identifier) {
        debugger;
        return {
            notificationChannelIdentifier: identifier,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            notifications: {}
        };
    };
    return NotificationChannel;
}());
exports.NotificationChannel = NotificationChannel;
var Notification = /** @class */ (function () {
    function Notification(sender, message) {
        this.sender = sender;
        this.message = message;
    }
    return Notification;
}());
exports.Notification = Notification;
//# sourceMappingURL=models.js.map