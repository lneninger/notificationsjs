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
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var models_1 = require("./models");
var NotificationChannelService = /** @class */ (function () {
    function NotificationChannelService(notificationGroupService, client) {
        this.notificationGroupService = notificationGroupService;
        this._onChannelNotificationReceived = new rxjs_1.Subject();
        this._onChannelNotificationSent = new rxjs_1.Subject();
        this._onChannelNotification = new rxjs_1.Subject();
        this._onChannelNotificationUpdated = new rxjs_1.Subject();
        this.channelNotifications = [];
        this._client = client;
    }
    Object.defineProperty(NotificationChannelService.prototype, "onChannelNotificationReceived", {
        get: function () {
            return this._onChannelNotificationReceived;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "onChannelNotificationSent", {
        get: function () {
            return this._onChannelNotificationSent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "onChannelNotification", {
        get: function () {
            return this._onChannelNotification;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "onChannelNotificationUpdated", {
        get: function () {
            return this._onChannelNotificationUpdated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "client", {
        get: function () {
            return this._client;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "notificationChannelRefPath", {
        get: function () {
            return NotificationChannelService.notificationChannelTableName + "/" + this.notificationChannelId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "notificationChannelNotificationsRefPath", {
        get: function () {
            return NotificationChannelService.notificationChannelTableName + "-notifications/" + this.notificationChannelId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "database", {
        get: function () {
            return this.notificationGroupService.notification.database;
        },
        enumerable: true,
        configurable: true
    });
    NotificationChannelService.prototype.processRemoteMessage = function (arg0) {
        throw new Error("Method not implemented.");
    };
    NotificationChannelService.create = function (client, notificationGroup) {
        var resultObj = new NotificationChannelService(notificationGroup, client);
        var result = resultObj.createFirebaseChannel()
            .pipe(operators_1.mergeMap(function (bool) {
            return rxjs_1.of(resultObj);
        }));
        return result;
    };
    NotificationChannelService.prototype.createFirebaseChannel = function () {
        var _this = this;
        //debugger;
        var observable = rxjs_1.of(this.client)
            .pipe(operators_1.mergeMap(function (client) {
            return _this.referenceNotificationChannelForClient(client);
        }))
            .pipe(operators_1.mergeMap(function (status) {
            _this.initializeNotificationWatch();
            return rxjs_1.of(true);
        }));
        return observable;
    };
    NotificationChannelService.prototype.referenceNotificationChannelForClient = function (client) {
        var _this = this;
        var channelUserIds = [this.notificationGroupService.notification.clientIdentifier, client.clientIdentifier].sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
        var notificationChannelIdentifier = channelUserIds.join('|');
        var pipeObservable = rxjs_1.Observable.create(function (observer) {
            //let notificationChannelKey: string;
            _this.database.ref("" + NotificationChannelService.notificationChannelTableName).orderByChild('notificationChannelIdentifier').equalTo(notificationChannelIdentifier).once('value', function (snapshot) {
                var notificationChannel = snapshot.val();
                var keys = Object.getOwnPropertyNames(notificationChannel);
                if (keys.length > 0) {
                    _this.channelDetails = notificationChannel[keys[0]];
                    _this.notificationChannelId = keys[0];
                    _this.notificationChannelRef = _this.database.ref(_this.notificationChannelRefPath);
                }
                else {
                    _this.notificationChannelId = _this.database.ref(NotificationChannelService.notificationChannelTableName).push().key;
                    var notificationChannel_1 = models_1.NotificationChannel.createNew(notificationChannelIdentifier);
                    _this.notificationChannelRef = _this.database.ref(_this.notificationChannelRefPath);
                    _this.notificationChannelRef.set(notificationChannel_1);
                }
                //this.notificationChannelDetailsRef = this.database.ref(`${this.notificationChannelDetailsRefPath}`);
                _this.notificationChannelRef.on('value', function (snapshot) {
                    //debugger;
                    _this.channelDetails = snapshot.val();
                });
                _this.notificationChannelNotificationsRef = _this.database.ref(_this.notificationChannelNotificationsRefPath);
                observer.next(true);
                observer.complete();
            });
        });
        return pipeObservable;
    };
    NotificationChannelService.prototype.initializeNotificationWatch = function () {
        var _this = this;
        this.database.ref("" + this.notificationChannelNotificationsRefPath).once('value', function (snapshot) {
            var notificationsObj = snapshot.val();
            if (notificationsObj == null)
                return;
            var keys = Object.getOwnPropertyNames(notificationsObj);
            var result = [];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                var notification = notificationsObj[key];
                result.push(notification);
            }
        });
        this.database.ref("" + this.notificationChannelNotificationsRefPath).on('child_added', function (snapshot) {
            var notification = snapshot.val();
            _this.channelNotifications.push(notification);
            var eventArgs = { direction: 'received', channelNotification: notification, notificationChannelService: _this };
            _this.onChannelNotificationReceived.next(eventArgs);
            _this.onChannelNotification.next(eventArgs);
        });
        this.database.ref("" + this.notificationChannelNotificationsRefPath).on('child_changed', function (snapshot) {
            //debugger;
            var notification = snapshot.val();
            var matches = _this.channelNotifications.filter(function (item) { return item.key == notification.key; });
            if (matches.length > 0) {
                var indexOf = _this.channelNotifications.indexOf(matches[0]);
                var newNotification = __assign({}, matches[0], notification);
                _this.channelNotifications.splice(indexOf, 1, newNotification);
                var eventArgs = { direction: 'received', channelNotification: notification, notificationChannelService: _this };
                _this.client.unreadMessages = _this.channelNotifications.filter(function (o) { return !o.read; }).length;
                _this.onChannelNotificationUpdated.next(eventArgs);
                _this.onChannelNotification.next(eventArgs);
            }
        });
    };
    NotificationChannelService.prototype.sendMessage = function (message) {
        var senderIdentifier = this.notificationGroupService.notification.clientIdentifier;
        var receiverIdentifier = this.client.clientIdentifier;
        var notification = new models_1.ChannelNotification(senderIdentifier, receiverIdentifier, message);
        var messageId = this.notificationChannelNotificationsRef.push().key;
        notification.key = messageId;
        this.database.ref(this.notificationChannelNotificationsRefPath + "/" + messageId).set(notification);
        var eventArgs = { direction: 'sent', channelNotification: notification, notificationChannelService: this };
        this.onChannelNotificationSent.next(eventArgs);
        this.onChannelNotification.next(eventArgs);
    };
    NotificationChannelService.prototype.setMessageAsRead = function (messageId) {
        this.database.ref(this.notificationChannelNotificationsRefPath + "/" + messageId).update({ 'read': true });
    };
    NotificationChannelService.prototype.markMessagesAsRead = function () {
        //debugger;
        var notRead = this.channelNotifications.filter(function (notification) { return !notification.read; });
        for (var i = 0; i < notRead.length; i++) {
            this.setMessageAsRead(notRead[i].key);
        }
    };
    NotificationChannelService.chatAttributeName = 'chat';
    NotificationChannelService.notificationChannelTableName = 'notification-channel';
    NotificationChannelService.pendingNotificationChannelTableName = 'pending-channels';
    return NotificationChannelService;
}());
exports.NotificationChannelService = NotificationChannelService;
//# sourceMappingURL=notificationchannel.service.js.map