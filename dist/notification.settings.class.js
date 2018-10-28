"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NotificationSettings = /** @class */ (function () {
    function NotificationSettings() {
    }
    /*Application Core*/
    //var firebaseScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.3/firebase.js';
    NotificationSettings.firebaseAppScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.5/firebase-app.js';
    NotificationSettings.firebaseMessagingScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.5/firebase-messaging.js';
    NotificationSettings.firebaseDatabaseScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.5/firebase-database.js';
    NotificationSettings.fontawesomeJsUrl = 'https://use.fontawesome.com/d0aafd5830.js';
    NotificationSettings.styleUrl = 'https://localhost:5001/widget/styles/app.css';
    /*Firebase Configuration*/
    NotificationSettings.firebaseLocalApplicationName = 'HIPALANET_NOTIFICATIONS';
    NotificationSettings.firebaseUrl = 'https://focus-notifications.firebaseio.com';
    NotificationSettings.firebaseDatabaseUrl = NotificationSettings.firebaseUrl;
    NotificationSettings.firebasePresenceUrl = NotificationSettings.firebaseUrl + "/presence/";
    NotificationSettings.firebaseSelfPresenceCallbackUrl = NotificationSettings.firebaseUrl + "/.info/connected";
    return NotificationSettings;
}());
exports.NotificationSettings = NotificationSettings;
//# sourceMappingURL=notification.settings.class.js.map