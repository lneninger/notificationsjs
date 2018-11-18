"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationGroupClient = /** @class */ (function () {
    function NotificationGroupClient(client) {
        this.clientInfo = client.clientInfo;
        this.channelRef = client.channelRef;
        this.channel = client.channel;
        this.notifications = client.notifications;
        this.sessionId = client.sessionId;
        this.unreadMessages = client.unreadMessages || 0;
    }
    Object.defineProperty(NotificationGroupClient.prototype, "clientIdentifier", {
        // returns clientId otherwise the currentSessionId
        get: function () {
            return this.clientInfo.clientId || this.sessionId;
        },
        enumerable: true,
        configurable: true
    });
    return NotificationGroupClient;
}());
exports.NotificationGroupClient = NotificationGroupClient;
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
var ChannelNotification = /** @class */ (function () {
    function ChannelNotification(sender, receiver, message) {
        this.sender = sender;
        this.receiver = receiver;
        this.message = message;
        this.createdAt = firebase.database.ServerValue.TIMESTAMP;
    }
    return ChannelNotification;
}());
exports.ChannelNotification = ChannelNotification;
//# sourceMappingURL=models.js.map