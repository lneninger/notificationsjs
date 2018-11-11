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
var notificationchannel_service_1 = require("./notificationchannel.service");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var NotificationGroupService = /** @class */ (function () {
    function NotificationGroupService(notification, defaultNotificationGroupKey, database, options) {
        var _this = this;
        this.notification = notification;
        this.database = database;
        // Events
        this.onClientConnected = new rxjs_1.Subject();
        this._onChannelNotificationReceived = new rxjs_1.Subject();
        this._onChannelNotificationSent = new rxjs_1.Subject();
        this._notificationGroupKey = defaultNotificationGroupKey;
        this.notificationChannels = [];
        this._connectedClients = [];
        var defaultOptions = {
            actorType: 'subscriber',
        };
        this.options = __assign({}, defaultOptions, options);
        console.log("Setting onClientConnected");
        //debugger;
        this.onClientConnected.subscribe(function (res) {
            //debugger;
            _this.connectedClients.push(res);
        });
        this.connectToGroup();
        //if (this.options.actorType == 'subscriber') {
        //    this.createNotificationChannel();
        //}
    }
    Object.defineProperty(NotificationGroupService.prototype, "notificationGroupKey", {
        get: function () {
            return this._notificationGroupKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationGroupService.prototype, "connectedClients", {
        get: function () {
            return this._connectedClients;
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
    Object.defineProperty(NotificationGroupService.prototype, "onChannelNotificationReceived", {
        get: function () {
            return this._onChannelNotificationReceived;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationGroupService.prototype, "onChannelNotificationSent", {
        get: function () {
            return this._onChannelNotificationSent;
        },
        enumerable: true,
        configurable: true
    });
    NotificationGroupService.prototype.connectToGroup = function (notificationGroupKey) {
        var internalNotificationGroupKey = notificationGroupKey || this.notificationGroupKey;
        var connectedRef;
        if (!this.notification.currentSessionId) {
            connectedRef = this.database.ref("connected/" + this.notificationGroupKey).push();
            this.notification.currentSessionId = connectedRef.key;
        }
        else {
            connectedRef = this.database.ref("connected/" + this.notificationGroupKey + "/" + this.notification.currentSessionId);
        }
        connectedRef.onDisconnect().remove();
        var connectedData = { clientId: this.notification.options.userId, sessionId: this.notification.currentSessionId };
        connectedRef.set(connectedData);
        this.initializeWatchConnected();
    };
    NotificationGroupService.prototype.initializeWatchConnected = function () {
        var _this = this;
        this.database.ref("connected/" + this.notificationGroupKey).on('child_added', function (snapshot) {
            //debugger;
            var key = snapshot.key;
            var data = snapshot.val();
            //debugger;
            // If connected udser is not the current user send connection event
            if (data.clientId != _this.notification.options.userId) {
                _this.onClientConnected.next(data);
            }
            //this.onClientConnected.complete();
        });
    };
    NotificationGroupService.prototype.getNotificationChannelByClient = function (client) {
        return this.notificationChannels.filter(function (o) { return o.client.sessionId == client.sessionId; });
    };
    NotificationGroupService.prototype.onSelectNotificationGroupClient = function (client) {
        var _this = this;
        var observable;
        //debugger;
        var channel = this.getNotificationChannelByClient(client);
        if (channel.length > 0) {
            observable = rxjs_1.of(channel[0]);
        }
        else {
            observable = notificationchannel_service_1.NotificationChannelService.create(client, this).pipe(operators_1.mergeMap(function (channelService) {
                _this.notificationChannels.push(channelService);
                channelService.onChannelNotificationReceived.subscribe(function (args) {
                    _this.channelNotificationReceived(args);
                });
                channelService.onChannelNotificationSent.subscribe(function (args) {
                    _this.channelNotificationSent(args);
                });
                return rxjs_1.of(channelService);
            }));
            //debugger;
        }
        return observable;
    };
    NotificationGroupService.prototype.channelNotificationReceived = function (args) {
        this.onChannelNotificationReceived.next(args);
    };
    NotificationGroupService.prototype.channelNotificationSent = function (args) {
        this.onChannelNotificationSent.next(args);
    };
    // Properties
    //currentSessionId: string;
    NotificationGroupService.notificationGroupTableName = 'notification-groups';
    return NotificationGroupService;
}());
exports.NotificationGroupService = NotificationGroupService;
//# sourceMappingURL=notificationgroup.service.js.map