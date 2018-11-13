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
var html_1 = require("./helpers/html");
var notificationgroup_service_1 = require("./notificationgroup.service");
var http_1 = require("./helpers/http");
var notification_settings_class_1 = require("./notification.settings.class");
var rxjs_1 = require("rxjs");
var NotificationModule = /** @class */ (function () {
    function NotificationModule(accountKey, defaultNotificationGroupKey, options) {
        // Setup scripts
        this.setupScriptsDone = false;
        this.firebaseScriptsLoaded = 0;
        this._accountKey = accountKey;
        if (!accountKey) {
            throw 'accountKey is required';
        }
        this._defaultNotificationGroupKey = defaultNotificationGroupKey || 'default';
        this.notificationGroups = [];
        // this.wrapper = element;
        var defaultOptions = {
            defaultActorType: 'subscriber',
            currentSessionCookieName: 'focusnotification|currentsession',
            currentSessionCookieExpiresInMinutes: 60
        };
        this.options = __assign({}, defaultOptions, (options || {}));
        // Events
        this.onInitialized = new rxjs_1.Subject();
        this.http = new http_1.HttpHelpers();
        this.config();
    }
    Object.defineProperty(NotificationModule.prototype, "accountKey", {
        get: function () {
            return this._accountKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationModule.prototype, "connectedIdentifier", {
        get: function () {
            return this.options.clientId || this.currentSessionId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationModule.prototype, "defaultNotificationGroupKey", {
        get: function () {
            return this._defaultNotificationGroupKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationModule.prototype, "currentSessionId", {
        get: function () {
            return html_1.HtmlHelpers.getCookie(this.options.currentSessionCookieName);
        },
        set: function (value) {
            debugger;
            if (value == null) {
                html_1.HtmlHelpers.deleteCookie(this.options.currentSessionCookieName);
            }
            else {
                html_1.HtmlHelpers.setCookie(this.options.currentSessionCookieName, value, this.options.currentSessionCookieExpiresInMinutes);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationModule.prototype, "clientIdentifier", {
        // returns clientId otherwise the currentSessionId
        get: function () {
            return this.options.clientId || this.currentSessionId;
        },
        enumerable: true,
        configurable: true
    });
    NotificationModule.prototype.config = function () {
        // alert('Common code here');
        console.log('test');
        //this.addExtraJs();
        this.addFirebaseScript();
    };
    //addExtraJs(): any {
    //    HtmlHelpers.addScript(NotificationSettings.fontawesomeJsUrl);
    //}
    NotificationModule.prototype.addFirebaseScript = function () {
        var _this = this;
        //HtmlHelpers.addStyle(NotificationSettings.styleUrl, null, null);
        html_1.HtmlHelpers.addScript(notification_settings_class_1.NotificationSettings.firebaseAppScriptUrl, function () {
            html_1.HtmlHelpers.addScript([notification_settings_class_1.NotificationSettings.firebaseMessagingScriptUrl, notification_settings_class_1.NotificationSettings.firebaseDatabaseScriptUrl, notification_settings_class_1.NotificationSettings.firebaseFunctionsScriptUrl], _this.firebaseScriptOnLoadFunction.bind(_this), _this.firebaseScriptOnErrorFunction.bind(_this));
        }, this.firebaseScriptOnErrorFunction.bind(this));
    };
    NotificationModule.prototype.firebaseScriptOnErrorFunction = function () {
        console.log('Firebase script was not loaded!!');
    };
    NotificationModule.prototype.firebaseScriptOnLoadFunction = function (element, event) {
        var _this = this;
        console.log('Firebase script was loaded!!');
        this.initializeApp().subscribe(function (res) {
            _this.initializeNotificationGroups();
            _this.onInitialized.next(true);
            _this.onInitialized.complete();
        });
    };
    NotificationModule.prototype.initializeApp = function () {
        var _this = this;
        // debugger;
        var initAppObservable = rxjs_1.Observable.create(function (observer) {
            _this.http.httpCall('GET', 'https://us-central1-focus-notifications.cloudfunctions.net/getFirebaseConfig', null, function (res) {
                // debugger;
                _this.firebaseConfig = res;
                console.log('Initializing Firebase Application: ', _this.firebaseConfig);
                _this.firebase = firebase.initializeApp(_this.firebaseConfig, notification_settings_class_1.NotificationSettings.firebaseLocalApplicationName);
                _this.database = _this.firebase.database();
                console.log('Application Name: ', _this.firebase.name);
                _this.connectedKey = _this.database.ref("" + NotificationModule.connectedTableName).push().key;
                var connected = { clientId: _this.options.clientId, sessionId: _this.connectedKey };
                _this.database.ref(NotificationModule.connectedTableName + "/" + _this.connectedKey).set(connected);
                _this.connectedRef = _this.database.ref(NotificationModule.connectedTableName + "/" + _this.connectedKey);
                _this.connectedRef.onDisconnect().remove();
                _this.setupScriptsDone = true;
                observer.next();
                observer.complete();
            });
        });
        return initAppObservable;
    };
    NotificationModule.prototype.initializeNotificationGroups = function () {
        if (this.options.defaultActorType == 'subscriber') {
            var options = {
                actorType: 'subscriber'
            };
            this.bindToNotificationGroup(this.defaultNotificationGroupKey, options);
        }
        else {
            // if attendant get chatgroups hosted by the current account
        }
    };
    NotificationModule.prototype.bindToNotificationGroup = function (accountKey, options) {
        var _this = this;
        // debugger;
        var group = new notificationgroup_service_1.NotificationGroupService(this, this.defaultNotificationGroupKey, this.database, options);
        this.notificationGroups.push(group);
        group.onChannelNotificationReceived.subscribe(function (args) {
        });
        group.onChannelNotificationSent.subscribe(function (args) {
            _this.channelNotificationSent(args);
        });
    };
    NotificationModule.prototype.channelNotificationSent = function (args) {
        this.updateCurrentExpirationIdExpirationDate();
    };
    NotificationModule.prototype.updateCurrentExpirationIdExpirationDate = function () {
        // cache the current value
        var currentSessionId = this.currentSessionId;
        // delete the cokkie
        this.currentSessionId = null;
        // recreate cookie with new value
        this.currentSessionId = currentSessionId;
    };
    NotificationModule.connectedTableName = 'connected';
    return NotificationModule;
}());
exports.NotificationModule = NotificationModule;
//# sourceMappingURL=notification.module.js.map