"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var notification_service_1 = require("./notification.service");
var rxjs_1 = require("rxjs");
var NotificationGroupService = /** @class */ (function () {
    function NotificationGroupService(notification, defaultNotificationGroupKey, database, options) {
        this.notification = notification;
        this.database = database;
        // Events
        this.onClientConnected = new rxjs_1.Subject();
        this._notificationGroupKey = defaultNotificationGroupKey;
        this.notifications = [];
        var defaultOptions = {
            actorType: 'subscriber',
        };
        this.options = __assign({}, defaultOptions, options);
        if (this.options.actorType == 'subscriber') {
            this.createChat();
        }
    }
    Object.defineProperty(NotificationGroupService.prototype, "notificationGroupKey", {
        get: function () {
            return this._notificationGroupKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationGroupService.prototype, "details", {
        get: function () {
            if (this._details) {
                return rxjs_1.of(this.details);
            }
            else {
                this.database.ref(NotificationGroupService.notificationGroupTableName + "/" + this.notificationGroupKey);
            }
        },
        enumerable: true,
        configurable: true
    });
    NotificationGroupService.prototype.connectToGroup = function () {
        var connectedRef;
        if (!this.currentSessionId) {
            connectedRef = this.database.ref("connected/" + this.notificationGroupKey).push();
            this.currentSessionId = connectedRef.key;
        }
        else {
            connectedRef = this.database.ref("connected/" + this.notificationGroupKey + "/" + this.currentSessionId);
        }
        connectedRef.onDisconnect().remove();
        connectedRef.set(true);
    };
    NotificationGroupService.prototype.initializeWatchConnected = function () {
        var _this = this;
        this.database.ref("connected/" + this.notificationGroupKey).on('child_added', function (snapshot) {
            _this.onClientConnected.next(snapshot.value());
            _this.onClientConnected.complete();
        });
    };
    NotificationGroupService.prototype.createChat = function () {
        var chat = new notification_service_1.NotificationService(this, this.options.actorType, this.database);
    };
    NotificationGroupService.prototype.processRemoteMessage = function (message) {
        var chatId = message.chatId;
        var chats = this.notifications.filter(function (o) { return o.chatId == chatId; });
        if (chats.length > 0) {
            chats[0].processRemoteMessage(message);
        }
    };
    NotificationGroupService.notificationGroupTableName = 'notification-groups';
    return NotificationGroupService;
}());
exports.NotificationGroupService = NotificationGroupService;
//# sourceMappingURL=notificationGroup.service.js.map