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
var chatgroup_service_1 = require("./chatgroup.service");
var http_1 = require("./helpers/http");
var notification_settings_class_1 = require("./notification.settings.class");
var NotificationModule = /** @class */ (function () {
    //chatId: string;
    //chatRefPath: string;
    //chatRef: any;
    function NotificationModule(key, options) {
        this.key = key;
        // Setup scripts
        this.setupScriptsDone = false;
        this.firebaseScriptsLoaded = 0;
        if (!key) {
            throw 'Key is required';
        }
        this.chatGroupServices = [];
        // this.wrapper = element;
        var defaultOptions = {
            currentSessionCookieName: 'focusnotification|currentsession',
            currentSessionCookieExpiresInMinutes: 60
        };
        this.options = __assign({}, defaultOptions, (options || {}));
        this.http = new http_1.Http();
        this.config();
    }
    Object.defineProperty(NotificationModule.prototype, "currentSessionId", {
        get: function () {
            return html_1.HtmlHelpers.getCookie(this.options.currentSessionCookieName);
        },
        set: function (value) {
            html_1.HtmlHelpers.setCookie(this.options.currentSessionCookieName, value, this.options.currentSessionCookieExpiresInMinutes);
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
            html_1.HtmlHelpers.addScript([notification_settings_class_1.NotificationSettings.firebaseMessagingScriptUrl, notification_settings_class_1.NotificationSettings.firebaseDatabaseScriptUrl], _this.firebaseScriptOnLoadFunction.bind(_this), _this.firebaseScriptOnErrorFunction.bind(_this));
        }, this.firebaseScriptOnErrorFunction.bind(this));
    };
    NotificationModule.prototype.firebaseScriptOnErrorFunction = function () {
        console.log('Firebase script was not loaded!!');
    };
    NotificationModule.prototype.firebaseScriptOnLoadFunction = function (element, event) {
        console.log('Firebase script was loaded!!');
        /*console.log('element: ', element);
       console.log('event: ', event);
       */
        this.initializeApp();
    };
    NotificationModule.prototype.initializeApp = function () {
        this.firebaseConfig = {
            apiKey: "AIzaSyCgVdtPw0go7eKPKadhBsbCH85GY6l91tE",
            authDomain: "focus-notifications.firebaseapp.com",
            databaseURL: notification_settings_class_1.NotificationSettings.firebaseDatabaseUrl,
            projectId: "focus-notifications",
            storageBucket: "focus-notifications.appspot.com",
            messagingSenderId: "95627638743"
        };
        console.log('Initializing Firebase Application: ', this.firebaseConfig);
        this.firebase = firebase.initializeApp(this.firebaseConfig, notification_settings_class_1.NotificationSettings.firebaseLocalApplicationName);
        this.database = this.firebase.database();
        //console.log("Firebase: " + JSON.stringify(firebase));
        console.log('Application Name: ', this.firebase.name);
        this.setupScriptsDone = true;
    };
    NotificationModule.prototype.createChatGroup = function (instanceKey, options) {
        var group = new chatgroup_service_1.ChatGroupService(this, instanceKey, this.database, options);
        this.chatGroupServices.push(group);
    };
    return NotificationModule;
}());
exports.NotificationModule = NotificationModule;
//# sourceMappingURL=notificationmodule.js.map