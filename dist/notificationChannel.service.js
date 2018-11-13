"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var models_1 = require("./models");
var NotificationChannelService = /** @class */ (function () {
    function NotificationChannelService(notificationGroupService, client) {
        this.notificationGroupService = notificationGroupService;
        this._onChannelNotificationReceived = new rxjs_1.Subject();
        this._onChannelNotificationSent = new rxjs_1.Subject();
        this.channelNotifications = [];
        //this.notificationChannelTableRef = this.database.ref(NotificationChannelService.notificationChannelTableName);
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
        return resultObj.createFirebaseChannel()
            .pipe(operators_1.map(function (o) { return resultObj; }));
    };
    NotificationChannelService.prototype.createFirebaseChannel = function () {
        var _this = this;
        //debugger;
        var observable = rxjs_1.of(this.client)
            .pipe(operators_1.mergeMap(function (client) {
            //debugger
            return _this.referenceNotificationChannelForClient(client);
        }))
            .pipe(operators_1.mergeMap(function (status) {
            //debugger;
            _this.initializeNotificationWatch();
            return rxjs_1.of(true);
        }));
        return observable;
    };
    NotificationChannelService.prototype.referenceNotificationChannelForClient = function (client) {
        var _this = this;
        var channelUserIds = [this.notificationGroupService.notification.clientIdentifier, client.clientId].sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
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
            //debugger;
            var keys = Object.getOwnPropertyNames(notificationsObj);
            var result = [];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                var notification = notificationsObj[key];
                result.push(notification);
            }
            //this.channelNotifications.push(notificationsObj.map(res => {
            //    let notificationKeys = Object.getOwnPropertyNames(res);
            //    for (let notificationKey of notificationKeys) {
            //    }
            //}));
        });
        this.database.ref("" + this.notificationChannelNotificationsRefPath).on('child_added', function (snapshot) {
            //debugger;
            var notification = snapshot.val();
            _this.channelNotifications.push(notification);
            var eventArgs = { channelNotification: notification, notificationChannelService: _this };
            _this.onChannelNotificationReceived.next(eventArgs);
        });
    };
    NotificationChannelService.prototype.sendMessage = function (message) {
        //if (!this.chatId) {
        //    this.createChat();
        //}
        var notification = new models_1.ChannelNotification(this.notificationGroupService.notification.currentSessionId, this.client.sessionId, message);
        var messageId = this.notificationChannelNotificationsRef.push().key;
        notification.key = messageId;
        this.database.ref(this.notificationChannelNotificationsRefPath + "/" + messageId).set(notification);
        var eventArgs = { channelNotification: notification, notificationChannelService: this };
        this.onChannelNotificationSent.next(eventArgs);
    };
    NotificationChannelService.chatAttributeName = 'chat';
    NotificationChannelService.notificationChannelTableName = 'notification-channel';
    NotificationChannelService.pendingNotificationChannelTableName = 'pending-channels';
    return NotificationChannelService;
}());
exports.NotificationChannelService = NotificationChannelService;
//# sourceMappingURL=notificationchannel.service.js.map